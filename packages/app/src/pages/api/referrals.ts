import { TileLoader } from "@glazed/tile-loader";
import { WalletAliases } from "@usher.so/datamodels";
import { aql } from "arangojs";
import { ArangoError } from "arangojs/error";
import { Base64 } from "js-base64";
import { parseCookies, setCookie } from "nookies";
import * as uint8arrays from "uint8arrays";
import { z } from "zod";

import { REFERRAL_TOKEN_DELIMITER } from "@/constants";
import { getAppDID } from "@/server/did";
import { useRouteHandler } from "@/server/middleware";
import { ApiRequest, ApiResponse, CampaignReference } from "@/types";
import { getArangoClient } from "@/utils/arango-client";
import { ceramic } from "@/utils/ceramic-client";

const handler = useRouteHandler();

const schema = z.object({
	partnership: z.string(),
	wallet: z.string().optional()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

/**
 * Sets a cookie to store a list of Partnerships that the user have been referred to
 * @param req ApiReqest
 * @param res ApiResponse
 * @param partnershipId Id of the Partnership
 * @returns `true` if the user has been referred to the partnership for the first time, otherwise `false`
 */
function setPartnershipCookie(req: ApiRequest, res: ApiResponse, partnershipId: string): boolean {
	const cookies = parseCookies({ req });
	const partnerships = cookies.__usher_partnerships ? cookies.__usher_partnerships.split(",") : [];
	const isAlreadyReferred = partnerships.some(p => p === partnershipId);

	if (!isAlreadyReferred) {
		setCookie({ res }, "__usher_partnerships", [...partnerships, partnershipId].join(","));
	}

	return !isAlreadyReferred;
}

/**
 * Fetches a Wallet Id from arangodb database
 * @param chain
 * @param address
 * @returns Wallet Id stored in the database. `undefined` if Wallet not found.
 */
async function fetchWalletId(chain: string, address: string): Promise<string> {
	const cursor = await arango.query(aql`
		RETURN DOCUMENT(Wallets, ${[chain, address].join(":")})._id
	`);

	const result = await cursor.all();
	return result[0];
}

/**
 * Saves a Wallet to the database
 * @param chain Wallet's chain
 * @param address Wallet's address
 * @returns Wallets Id stored in the database
 */
async function saveWallet(chain: string, address: string): Promise<string> {
	const cursor = await arango.query(aql`
		INSERT {
			_key: ${[chain, address].join(":")},
			chain: ${chain},
			address: ${address},
			created_at: ${Date.now()}
		} INTO Wallets OPTIONS { waitForSync: true }
		RETURN NEW._id
	`);

	const result = await cursor.all();
	return result[0]
}

/**
 * Checks if the Wallet is already referred by the Partnership.
 * @param walletId Wallet identifier in the database, i.e. `Wallets/[cahin]:[address]`
 * @param partnershipId Partnership identifier in the database, i.e. `Partnerships/[key]`
 * @returns `boolean`
 */
async function isWalletReferred(walletId: string, partnershipId: string): Promise<boolean> {
	const cursor = await arango.query(aql`
		FOR referral IN Referrals
		FILTER
				referral._from == ${partnershipId} &&
				referral._to == ${walletId}
		RETURN referral
	`);
	return (await cursor.all()).length != 0;
}

/**
 * Refers the Wallet to the Partnership.
 * @param walletId Wallet identifier in the database, i.e. `Wallets/[cahin]:[address]`
 * @param partnershipId Partnership identifier in the database, i.e. `Partnerships/[key]`
 */
async function referWallet(walletId: string, partnershipId: string) {
	const cursor = await arango.query(aql`
		INSERT {
			_from: CONCAT("Partnerships/", ${partnershipId}),
			_to: ${walletId}
		} INTO Referrals
	`);
}

/**
 * Increments number of hits of the Partnership
 * @param partnershipId A partnership to increment hits to
 */
async function incrementPartnershipHits(partnershipId: string) {
	await arango.query(aql`
		LET partnership = DOCUMENT(Partnerships, ${partnershipId})
		UPDATE partnership WITH {
			hits: partnership.hits + 1
		} IN Partnerships
	`);
}

/**
 * Creates a pending Conversion and a Referral edge from the Paretnership to the Conversion.
 * @param partnershipId A partnership to assight the created conversion
 * @returns Id of the created Conversion
 */
async function createPendigConversion(partnershipId: string): Promise<string> {
	const cursor = await arango.query(aql`
		INSERT {
			created_at: ${Date.now()}
		} INTO Conversions OPTIONS { waitForSync: true }
		LET conversion = NEW
		INSERT {
			_from: CONCAT("Partnerships/", ${partnershipId}),
			_to: conversion._id
		} INTO Referrals
		RETURN conversion
	`);

	const result = await cursor.all();
	const [conversion] = result;
	return conversion._key;
}

/**
 * POST: Create a new referral or verifies the extension of a referral
 */
handler.router.post(async (req, res) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { partnership, wallet } = body;
	const [walletChain, walletAddress] = wallet ? wallet.split(":") : [];
	const did = await getAppDID();

	const stream = await loader.load<CampaignReference>(partnership);
	const campaignRef = stream.content;
	const [controller] = stream.controllers;

	// Validate that the provided partnership is valid
	if (
		!(
			campaignRef.address &&
			campaignRef.chain &&
			controller &&
			stream.metadata.schema === WalletAliases.schemas.Partnership
		)
	) {
		req.log.warn(
			{
				vars: {
					partnership,
					campaignRef,
					controller,
					schema: stream.metadata.schema,
					modelSchema: WalletAliases.schemas.Partnership
				}
			},
			"Partnership is invalid"
		);
		return res.status(400).json({
			success: false
		});
	}

	req.log.debug({ partnership }, "Partnership is valid for this referral");

	// Ensure that the partnership has been indexed
	const dataCursor = await arango.query(aql`
		RETURN {
			partnership: DOCUMENT("Partnerships", ${partnership}),
			campaign: DOCUMENT("Campaigns", ${[campaignRef.chain, campaignRef.address].join(":")})
		}
	`);
	const dataResults = await dataCursor.all();
	const [{ partnership: partnershipData, campaign: campaignData }] =
		dataResults;

	if (!campaignData) {
		req.log.warn(
			{
				vars: {
					partnership,
					campaignRef
				}
			},
			"Campaign does not exist"
		);
		return res.status(400).json({
			success: false
		});
	}

	if (partnershipData) {
		req.log.info(
			{ vars: { partnership, results: dataResults } },
			"Partnership already indexed"
		);
	} else {
		req.log.info(
			{ vars: { partnership, controller } },
			"Indexing Partnership..."
		);
		const partnershipId = stream.id.toString();
		try {
			const cursor = await arango.query(aql`
			INSERT {
				_key: ${partnershipId},
				created_at: ${Date.now()},
				hits: 0,
				rewards: 0
			} INTO Partnerships OPTIONS { waitForSync: true }
			LET p = NEW
			UPSERT { _key: ${controller} }
			INSERT { _key: ${controller}, created_at: ${Date.now()} }
			UPDATE {}
			IN Dids OPTIONS { waitForSync: true }
			LET edges = (
				FOR params IN [
					{
						_from: p._id,
						_to: ${`Campaigns/${[campaignRef.chain, campaignRef.address].join(":")}`}
					},
					{
						_from: CONCAT("Dids/", ${controller}),
						_to: p._id
					}
				]
					INSERT {
						_from: params._from,
						_to: params._to
					} INTO Engagements
					RETURN NEW
			)
			RETURN {
				p,
				edges
			}
		`);

			const results = await cursor.all();
			req.log.info({ results }, "Partnership indexed");
		} catch (e) {
			if (e instanceof ArangoError && e.errorNum === 1200) {
				req.log.warn({ conflictErr: e }, "Arango Conflict Error");
			} else {
				throw e;
			}
		}
	}

	// By default, the campaign security includes everything. If disable_verification is true, then all partners can start earning rewards.
	if (campaignData.disable_verification !== true) {
		// Check that the Partner is Verified, if the Campaign requires as such
		const verifyCheckCursor = await arango.query(aql`
			FOR d IN 1..1 INBOUND CONCAT("Partnerships/", ${partnership}) Engagements
				FOR did IN 1..1 ANY d Related
					COLLECT _id = did._id
					FOR e IN 1..1 OUTBOUND _id Verifications
						FILTER STARTS_WITH(e._id, "PersonhoodEntries") AND e.success == true
						COLLECT v_id = e._id
						LET entry = DOCUMENT(v_id)
						SORT entry.created_at DESC
						RETURN entry
		`);
		const verifyResults = await verifyCheckCursor.all();
		req.log.debug({ verifyResults }, "personhood fetch results");
		if (verifyResults.length === 0) {
			// Partner is not verified.
			req.log.info(
				{ vars: { partnership } },
				"Campaign requires verification, but Partner is not verified"
			);
			return res.status(401).json({
				success: false
			});
		}
	}

	// By default, Campaigns do not include a whitelist. However, if it does, we need to ensure here that the referring partner is whitelisted.
	if (typeof campaignData.whitelist === "object") {
		const { partners: whitelistedPartners = [] } = campaignData.whitelist;
		if (!whitelistedPartners.includes(partnership)) {
			// Partner is not whitelisted.
			req.log.info(
				{ vars: { partnership } },
				"Campaign requires whitelist, but Partner is not whitelisted"
			);
			return res.status(401).json({
				success: false
			});
		}
	}

	// Check Partnership cookie. Increase the Partnership hits if the cookie isn't set yet.
	if (setPartnershipCookie(req, res, partnership)) {
		await incrementPartnershipHits(partnership);
	}

	// Save user's wallet if any
	if (wallet) {
		let walletId = await fetchWalletId(walletChain, walletAddress);

		if (!walletId) {
			walletId = await saveWallet(walletChain, walletAddress);
		}

		if (!(await isWalletReferred(walletId, partnership))) {
			await referWallet(walletId, partnership);
		}
	}

	// Create pending web-based Conversion
	const conversionId = await createPendigConversion(partnership);

	// Prepare a referral token for User.JS library that will use it on a Brand's pageю
	const raw = [conversionId, partnership].join(REFERRAL_TOKEN_DELIMITER);
	const jwe = await did.createJWE(uint8arrays.fromString(raw), [did.id]);
	const token = Base64.encodeURI(JSON.stringify(jwe));

	const prefix = Base64.encodeURI(
		[campaignData.chain, campaignData.id].join(":")
	);

	const newToken = [prefix, token].join(".");

	const url = new URL(campaignData.details.destination_url);
	url.searchParams.set("_ushrt", newToken);

	return res.json({
		success: true,
		data: {
			token: newToken,
			url: url.toString()
		}
	});
});

export default handler.handle();
