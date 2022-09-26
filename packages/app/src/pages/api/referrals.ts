import { z } from "zod";
import { Base64 } from "js-base64";
import { setCookie, parseCookies } from "nookies";
import * as uint8arrays from "uint8arrays";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";
import { ArrayCursor } from "arangojs/cursor";
import { ArangoError } from "arangojs/error";
import { WalletAliases } from "@usher.so/datamodels";

import { CampaignReference } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";
import { REFERRAL_TOKEN_DELIMITER } from "@/constants";

const handler = useRouteHandler();

const schema = z.object({
	partnership: z.string(),
	wallet: z.string().optional()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

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
			stream.metadata.schema === WalletAliases.schemas.partnership
		)
	) {
		req.log.warn(
			{
				vars: {
					partnership,
					campaignRef,
					controller,
					schema: stream.metadata.schema,
					modelSchema: WalletAliases.schemas.partnership
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
			campaign: DOCUMENT("Campaigns", ${[campaignRef.chain, campaignRef.address].join(
				":"
			)})
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

	// Check if the User has been referred for the first time by the Partnership
	const cookies = parseCookies({ req });
	const partnerships = cookies.__usher_partnerships ? cookies.__usher_partnerships.split(",") : [];
	if (partnerships.some(p => p === partnership)) {
		// User already referred by the Partnership.
		req.log.info(
			{ vars: { partnership } },
			"User already referred by the Partnership"
		);
		return res.status(401).json({
			success: false
		});
	}
	setCookie({ res }, "__usher_partnerships", [...partnerships, partnership].join(","));

	let cursor: ArrayCursor;
	// Create the conversion and the referral edge
	if (!wallet) {
		cursor = await arango.query(aql`
		  LET partnership = DOCUMENT("Partnerships", ${partnership})
			UPDATE partnership WITH {
				hits: partnership.hits + 1
			} IN Partnerships
			INSERT {
				created_at: ${Date.now()}
			} INTO Conversions OPTIONS { waitForSync: true }
			LET c = NEW
			INSERT {
				_from: CONCAT("Partnerships/", ${partnership}),
				_to: c._id
			} INTO Referrals
			LET r = NEW
			RETURN {
				conversion: c,
				referral: r
			}
	`);
	} else {
		// Create the conversion, wallet and the referral edges
		cursor = await arango.query(aql`
		  LET partnership = DOCUMENT("Partnerships", ${partnership})
			UPDATE partnership WITH {
				hits: partnership.hits + 1
			} IN Partnerships
			INSERT {
				created_at: ${Date.now()}
			} INTO Conversions OPTIONS { waitForSync: true }
			LET c = NEW
			INSERT {
				_key: ${wallet},
				created_at: ${Date.now()}
			} INTO Wallets OPTIONS { waitForSync: true }
			LET w = NEW
			LET refs = (
				FOR r IN [c, w]
					INSERT {
						_from: CONCAT("Partnerships/", ${partnership}),
						_to: r._id
					} INTO Referrals
					RETURN NEW
			)
			RETURN {
				conversion: c,
				referral: refs[0],
				referralWallet: refs[1]
			}
	`);
	}

	const results = await cursor.all();

	const [{ conversion }] = results;
	const conversionId = conversion._key;

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
