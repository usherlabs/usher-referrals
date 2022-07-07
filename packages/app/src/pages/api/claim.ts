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

	// Get rewards from partnership and rewards claimed from campaign
	const pCursor = await arango.query(aql`
		LET rewards_claimed = (
			FOR cl IN 1..1 OUTBOUND partnership Engagements
				FILTER STARTS_WITH(cl._id, "Claims")
				COLLECT AGGREGATE amount = SUM(cl.amount)
				RETURN amount
		)
		RETURN TO_NUMBER(rewards_claimed)
	`);
	const pResults = await pCursor.all();
	const [rewardsClaimed] = pResults; // will always return an array with a single integer result.

	// Determine withdraw amount -- by calculating remaining rewards
	let rewardsToPay = partnershipData.rewards || 0;
	if (typeof campaignData.reward.limit === "number") {
		// Check if the Campaign is limited at all
		const remainingRewards = campaignData.reward.limit - rewardsClaimed;
		if (rewardsToPay > remainingRewards) {
			rewardsToPay = remainingRewards;
		}
	}

	// Ensure that amount to be paid is greater than amount in internal wallet -- otherwise send whatevers in the wallet and update partnership amount
	const did = await getAppDID();
	if (campaignData.chain === Chains.ARWEAVE) {
		const balance = await arweave.wallets.getBalance(
			campaignData._internal.address
		);
		const arBalanceStr = arweave.ar.winstonToAr(balance);
		let arBalance = parseFloat(arBalanceStr);
		if (Number.isNaN(arBalance)) {
			arBalance = 0;
		}
		if (rewardsToPay > arBalance) {
			rewardsToPay = arBalance;
		}

		// Transfer fee amount minus gas x2 from previous transaction to platform wallet
		try {
			const jwe = JSON.parse(Base64.decode(campaignData._internal.key));
			const dec = await did.decryptJWE(jwe);
			const raw = uint8arrays.toString(dec);
			const jwk = JSON.parse(raw);

			const fee = rewardsToPay * (1 - FEE_MULTIPLIER);
			// TODO: Continue payout development
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

	return res.json({
		success: false,
		data: {
			to,
			amount: 0
		}
	});
});

export default handler;
