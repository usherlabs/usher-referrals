import { TileDocument } from "@ceramicnetwork/stream-tile";
import { z } from "zod";
import { Base64 } from "js-base64";
import cors from "cors";
import * as uint8arrays from "uint8arrays";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";
import { TileLoader } from "@glazed/tile-loader";
import { ShareableOwnerModel } from "@usher/ceramic";

import {
	ApiResponse,
	ApiRequest,
	CampaignReference,
	Campaign,
	CampaignStrategies
} from "@/types";
import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getAppDID } from "@/server/did";
import { getArangoClient } from "@/utils/arango-client";
import { ceramic } from "@/utils/ceramic-client";

const handler = getHandler();

const arango = getArangoClient();

const loader = new TileLoader({ ceramic });

const schema = z.object({
	code: z.string(),
	eventId: z.number(),
	nativeId: z.string().optional(),
	metadata: z.record(z.union([z.string(), z.number(), z.boolean()])),
	commit: z.number()
});

const isPartnershipStreamValid = (stream: TileDocument<CampaignReference>) => {
	return (
		stream.content.address &&
		stream.content.chain &&
		stream.controllers.length > 0 &&
		stream.metadata.schema === ShareableOwnerModel.schemas.partnership
	);
};

/**
 * GET: Accepts encypted token unique to the Referred User from Advertiser page to produce a Converison code
 * POST: Uses the conversion code to submit conversion data and save a conversion
 */

// Initializing the cors middleware
handler
	.use(cors())
	.use(withAuth)
	.get(async (req: ApiRequest, res: ApiResponse) => {
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				success: false
			});
		}

		const did = await getAppDID();

		let message;
		try {
			const jwe = JSON.parse(Base64.decode(token as string));
			const raw = await did.decryptJWE(jwe);
			message = uint8arrays.toString(raw);
		} catch (e) {
			req.log.error({ token }, "Could not decrypt referral token");
			return res.status(400).json({
				success: false
			});
		}

		const sp = message.split(".");
		const id = sp.shift();
		const partnership = sp.join(".");

		// Check conversion id of the token
		const checkCursor = await arango.query(aql`
		RETURN DOCUMENT("Conversions", ${id})
	`);

		const checkResult = (await checkCursor.all()).filter(
			(result) => !isEmpty(result)
		);
		if (checkResult.length === 0) {
			req.log.error(
				{ token, id, partnership, checkResult },
				"Conversion does not exist within index"
			);
			return res.status(400).json({
				success: false
			});
		}
		// Check if the result is already converted
		const [result] = checkResult;
		if (result.converted_at) {
			req.log.error(
				{ token, id, partnership, checkResult },
				"Seed conversion already converted"
			);
			return res.status(400).json({
				success: false
			});
		}

		// Check the partnership id of the token
		const stream = await loader.load<CampaignReference>(partnership);
		// Validate that the provided partnership is valid
		if (
			!isPartnershipStreamValid(
				// @ts-ignore
				stream
			)
		) {
			req.log.info(
				{
					token,
					id,
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

		// Once all is valid, sign the message
		const jws = await did.createJWS(message);
		const sig = Base64.encode(JSON.stringify(jws));

		const rawCode = {
			id,
			partnership,
			message,
			sig,
			createdAt: Date.now(),
			expiresIn: 10 * 60 * 60 * 1000 // 10 minutes in milliseconds
		};
		const jwe = await did.createJWE(
			uint8arrays.fromString(Base64.encode(JSON.stringify(rawCode))),
			[did.id]
		);
		const code = Base64.encode(JSON.stringify(jwe));

		return res.json({
			success: true,
			data: {
				code
			}
		});
	})
	.post(async (req: ApiRequest, res: ApiResponse) => {
		let body: z.infer<typeof schema>;
		try {
			body = await schema.parseAsync(req.body);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { code, ...conversion } = body;
		const did = await getAppDID();

		// Destruct the code and verify the signature against the message
		let raw: {
			id: string;
			partnership: string;
			message: string;
			sig: string;
			createdAt: number;
			expiresIn: number;
		};
		try {
			const jwe = JSON.parse(Base64.decode(code));
			const rawBytes = await did.decryptJWE(jwe);
			const rawEncoded = uint8arrays.toString(rawBytes); // base64 string
			raw = JSON.parse(Base64.decode(rawEncoded));

			const jws = JSON.parse(Base64.decode(raw.sig));
			await did.verifyJWS(jws, { issuer: did.id });

			// Verify that the code has not expired
			if (raw.createdAt + raw.expiresIn < Date.now()) {
				throw new Error(`Code has expired`);
			}
		} catch (e) {
			req.log.error({ e }, "Could not destruct and verify code");
			return res.status(400).json({
				success: false
			});
		}

		const stream = await loader.load(raw.partnership);
		// Validate that the provided partnership is valid
		if (
			!isPartnershipStreamValid(
				// @ts-ignore
				stream
			)
		) {
			req.log.info(
				{
					code,
					raw,
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

		const partnershipId = stream.id.toString();
		const campaignRef = stream.content as CampaignReference;

		// Pull the campaign
		//* In the future, we'll be pulling the campaign data from Smart Contracts.
		const cursor = await arango.query(aql`
			RETURN DOCUMENT("Campaigns", ${[campaignRef.chain, campaignRef.address].join(
				":"
			)})
		`);
		const results = (await cursor.all()).filter((result) => !isEmpty(result));
		if (results.length === 0) {
			req.log.error({ code, raw }, "No campaign for partnership");
			return res.status(400).json({
				success: false
			});
		}
		const [campaign] = results as ({
			_key: string;
		} & Campaign)[];

		// Validate the Conversion Data
		// 1. Event exists
		if (typeof campaign.events[conversion.eventId] === "undefined") {
			req.log.error({ campaign, conversion }, "Event ID does not exist");
			return res.status(400).json({
				success: false,
				message: "Event ID does not exist"
			});
		}
		const event = campaign.events[conversion.eventId];
		// 2. native_id is unique for that given Campaign and event_id -- unless there is a nativeLimit
		let { rate } = event;
		let { commit } = conversion;
		if (typeof event.nativeLimit === "undefined") {
			const nativeIdCheckCursor = await arango.query(aql`
				FOR c IN 1..1 OUTBOUND CONCAT("Partnerships/", ${partnershipId}) Referrals
					FILTER c.native_id == ${conversion.nativeId} AND c.event_id == ${conversion.eventId}
					COLLECT WITH COUNT INTO length
					RETURN length
			`);
			const nativeIdCheckResults = await nativeIdCheckCursor.all();
			const [length] = nativeIdCheckResults;
			if (length > 0) {
				req.log.warn({ campaign, conversion }, "Native ID already Converted");
				return res.json({
					success: false,
					message: "Native ID already Converted"
				});
			}
		} else {
			const processedCheckCursor = await arango.query(aql`
				FOR c IN 1..1 OUTBOUND CONCAT("Partnerships/", ${partnershipId}) Referrals
					FILTER c.native_id == ${conversion.nativeId} AND c.event_id == ${conversion.eventId}
					COLLECT AGGREGATE processed = SUM(c.commit)
					RETURN processed
			`);
			const [processed] = await processedCheckCursor.all();
			const remainingCommittable = event.nativeLimit - processed;
			if (remainingCommittable <= 0) {
				// Cannot commit any more for this native id
				req.log.warn({ campaign, conversion }, "Native ID already Converted");
				return res.json({
					success: false,
					message: "Native ID already Converted"
				});
			}

			let ratePercentage = 1;
			let toBeCommit = conversion.commit;
			if (remainingCommittable < toBeCommit) {
				toBeCommit = remainingCommittable;
				ratePercentage = remainingCommittable / toBeCommit;
			}
			rate = ratePercentage * event.rate;
			commit = toBeCommit;
		}

		// Determine the reward amount
		let rewards = rate;
		if (typeof event.perCommit !== "undefined" && event.perCommit) {
			rewards = rate * commit;
		}

		// Add Percentage base Rate calculation -- based on amount in metadata
		if (event.strategy === CampaignStrategies.PERCENTAGE) {
			let { amount } = conversion.metadata;
			if (typeof amount === "string") {
				amount = parseFloat(amount);
			}
			if (amount && typeof amount === "number") {
				rewards *= amount;
			} else {
				const errMsg = `'amount' missing from 'metadata' for percentage based conversion event`;
				req.log.warn({ campaign, conversion }, errMsg);
				return res.json({
					success: false,
					message: errMsg
				});
			}
		}

		req.log.info(
			{ rate, commit, rewards, campaign, conversion },
			"Saving conversion..."
		);
		// Save the Conversion Data
		// Update the associated Partnership's reward amount
		const saveCursor = await arango.query(aql`
			UPDATE {
				_key: ${raw.id},
				partnership: ${raw.partnership}
				message: ${raw.message},
				sig: ${raw.sig},
				event_id: ${conversion.eventId},
				native_id: ${conversion.nativeId},
				converted_at: ${Date.now()},
				metadata: ${conversion.metadata},
				commit: ${commit}
			} IN Conversions OPTIONS { waitForSync: true }
			UPDATE {
				_key: ${partnershipId}
				rewards: ${rewards}
			} IN Partnerships OPTIONS { waitForSync: true }
			RETURN {
				conversion: DOCUMENT("Conversions", ${raw.id}),
				partnership: DOCUMENT("Partnerships", ${partnershipId})
			}
		`);

		const saveResults = await saveCursor.all();

		req.log.info({ saveResults }, "Conversion and Partnership Saved!");

		return res.json({
			success: true
		});
	});

export default handler;
