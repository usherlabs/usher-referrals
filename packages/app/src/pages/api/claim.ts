import { z } from "zod";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";
import { ShareableOwnerModel } from "@usher/ceramic";
import { TileDocument } from "@ceramicnetwork/stream-tile";
// import ono from "@jsdevtools/ono";

import {
	ApiResponse,
	AuthApiRequest,
	CampaignReference,
	Chains
} from "@/types";
import getHandler from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";
import withAuth from "@/server/middleware/auth";
import { getArweaveClient } from "@/utils/arweave-client";
import { FEE_MULTIPLIER } from "@/constants";
import handleException from "@/utils/handle-exception";
import { appPackageName, appVersion } from "@/env-config";

const handler = getHandler();

const schema = z.object({
	partnership: z.string(),
	to: z.string()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

const arweave = getArweaveClient();

const isPartnershipStreamValid = (stream: TileDocument<CampaignReference>) => {
	return (
		stream.content.address &&
		stream.content.chain &&
		stream.controllers.length > 0 &&
		stream.metadata.schema === ShareableOwnerModel.schemas.partnership
	);
};

/**
 * POST: Perform the Crypto Transfer based on the Campaign
 */
handler.use(withAuth).post(async (req: AuthApiRequest, res: ApiResponse) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { partnership, to } = body;

	// Get campaign from partnership
	const stream = await loader.load<CampaignReference>(partnership);
	if (
		!isPartnershipStreamValid(
			// @ts-ignore
			stream
		)
	) {
		req.log.info(
			{
				to,
				partnership,
				streamContent: stream.content,
				schema: stream.metadata.schema,
				modelSchema: ShareableOwnerModel.schemas.partnership
			},
			"Partnership is invalid"
		);
		return res.status(400).json({
			success: false
		});
	}

	const campaignRef = stream.content;
	const partnershipId = stream.id.toString();
	const campaignKey = [campaignRef.chain, campaignRef.address].join(":");

	// Validate that the partnership and campaign are associated to authed dids
	const checkCursor = await arango.query(aql`
		FOR d IN ${req.user.map(({ did }) => did)}
			FOR rd IN 1..1 ANY CONCAT("Dids/", d) Related
				COLLECT _id = rd._id
				FOR e IN 1..2 OUTBOUND _id Engagements
					FILTER e._key == ${partnershipId} OR e._key == ${campaignKey}
					RETURN e
	`);
	const checkResults = (await checkCursor.all()).filter((result) => !!result);
	const partnershipData = checkResults.find(
		(result) => result._key === partnershipId
	);
	const campaignData = checkResults.find(
		(result) => result._key === campaignKey
	);
	if (!partnershipData || !campaignData) {
		req.log.warn(
			{
				to,
				partnership,
				campaignKey,
				checkResults,
				user: req.user
			},
			"Partnership and/or Campaign is not associated to User"
		);
		return res.status(400).json({
			success: false
		});
	}

	req.log.debug("Campaign and Partnership indexed data fetched");

	// Determine withdraw amount -- by calculating remaining rewards
	let rewardsToPay = partnershipData.rewards || 0;
	if (typeof campaignData.reward.limit === "number") {
		// Get rewards from partnership and rewards claimed from campaign
		const pCursor = await arango.query(aql`
			LET rewards_claimed = (
				FOR cl IN 1..1 OUTBOUND CONCAT("Partnerships/", ${partnershipId}) Engagements
					FILTER STARTS_WITH(cl._id, "Claims")
					COLLECT AGGREGATE amount = SUM(cl.amount)
					RETURN amount
			)
			RETURN TO_NUMBER(rewards_claimed)
		`);
		const pResults = await pCursor.all();
		const [rewardsClaimed] = pResults; // will always return an array with a single integer result.

		req.log.debug({ rewardsClaimed }, "Previously Rewards Claims fetched");

		// Check if the Campaign is limited at all
		const remainingRewards = campaignData.reward.limit - rewardsClaimed;
		if (rewardsToPay > remainingRewards) {
			rewardsToPay = remainingRewards;
		}
	}

	// Ensure that amount to be paid is greater than amount in internal wallet -- otherwise send whatevers in the wallet and update partnership amount
	if (campaignData.chain === Chains.ARWEAVE) {
		const balance = await arweave.wallets.getBalance(
			campaignData._internal.address
		);
		const arBalanceStr = arweave.ar.winstonToAr(balance);
		const winstonBalance = parseFloat(balance);
		let arBalance = parseFloat(arBalanceStr);
		if (Number.isNaN(arBalance) || Number.isNaN(winstonBalance)) {
			arBalance = 0;
		}

		if (arBalance === 0) {
			req.log.error("Insufficient funding for Campaign");
			return res.status(402).json({
				success: false,
				data: {
					to,
					amount: 0
				}
			});
		}

		let fee = rewardsToPay * FEE_MULTIPLIER; // x * 0.1
		const totalToPay = fee + rewardsToPay;
		if (totalToPay > arBalance) {
			fee = arBalance * FEE_MULTIPLIER;
			rewardsToPay = arBalance - fee;
		}

		// Transfer fee amount minus gas x2 from previous transaction to platform wallet
		try {
			const did = await getAppDID();
			const jwe = JSON.parse(Base64.decode(campaignData._internal.key));
			const dec = await did.decryptJWE(jwe);
			const raw = uint8arrays.toString(dec);
			const jwk = JSON.parse(raw);

			const rewardTx = await arweave.createTransaction(
				{
					target: to,
					quantity: arweave.ar.arToWinston(`${rewardsToPay}`)
				},
				jwk
			);
			const txTags = [
				["Application", "Usher"],
				["UsherCampaign", campaignRef.address],
				["UsherPartnership", partnershipId]
			];
			if (appPackageName && appVersion) {
				txTags.push([appPackageName, appVersion]);
			}

			fee -= parseFloat(arweave.ar.winstonToAr(rewardTx.reward)) * 2; // ensure there's enough gas for the transfers.
			const feeTx = await arweave.createTransaction({
				target: to,
				quantity: arweave.ar.arToWinston(`${fee}`)
			});

			req.log.debug({ fee, rewardsToPay }, "Fee and reward calculated");

			// Tags
			txTags.forEach(([tagName, tagVal]) => {
				rewardTx.addTag(tagName, tagVal);
				feeTx.addTag(tagName, tagVal);
			});
			rewardTx.addTag("UsherTransferType", "Reward");
			feeTx.addTag("UsherTransferType", "Fee");

			await arweave.transactions.sign(rewardTx, jwk);
			await arweave.transactions.sign(feeTx, jwk);

			const [rewardTxResponse, feeTxResponse] = await Promise.all([
				arweave.transactions.post(rewardTx),
				arweave.transactions.post(feeTx)
			]);

			if (rewardTxResponse.status !== 200) {
				req.log.error(
					{ rewardTxResponse, rewardTx, rewardsToPay },
					"Failed to submit reward transaction"
				);
				return res.json({
					success: false,
					data: {
						to,
						amount: rewardsToPay
					}
				});
			}
			if (feeTxResponse.status !== 200) {
				req.log.warn(
					{ feeTxResponse, feeTx, fee },
					"Failed to submit fee transaction"
				);
				return res.json({
					success: false,
					data: {
						to,
						amount: rewardsToPay
					}
				});
			}

			req.log.info(
				{ fee, rewardsToPay, rewardTx: rewardTx.id, feeTx: feeTx.id },
				"Fee and reward transfers complete"
			);

			// Index Claim, Reduce Remaining Rewards for Partnership
			const indexCursor = await arango.query(aql`
				INSERT {
					amount: ${rewardsToPay},
					to: ${to},
					fee: ${fee}
					ar_txs: {
						reward: ${rewardTx.id},
						fee: ${feeTx.id}
					},
					created_at: ${Date.now()}
				} INTO Claims OPTIONS { waitForSync: true }
				LET c = NEW
				INSERT {
					_from: p._id,
					_to: c._id
				} INTO Engagements
				LET e = NEW
				LET p = DOCUMENT("Partnerships", ${partnershipId})
				UPDATE { _key: p._key } WITH { rewards: p.rewards - ${rewardsToPay} } IN Partnerships
				RETURN {
					partnership: p,
					claim: c,
					edge: e
				}
			`);
			const indexResults = await indexCursor.all();

			req.log.info({ indexResults }, "Claim indexed");

			return res.json({
				success: true,
				data: {
					to,
					amount: rewardsToPay
				}
			});
		} catch (e) {
			handleException(e);
			req.log.error(
				{
					e
				},
				"Cannot execute Arweave Rewards Transfer"
			);
			return res.status(400).json({
				success: false
			});
		}
	}

	req.log.warn("Unsupported partnership");

	return res.json({
		success: false,
		data: {
			to,
			amount: 0
		}
	});
});

export default handler;
