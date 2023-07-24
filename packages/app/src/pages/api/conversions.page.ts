import { TileDocument } from "@ceramicnetwork/stream-tile";
import { z } from "zod";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";
import { TileLoader } from "@glazed/tile-loader";
import { WalletAliases } from "@usher.so/datamodels";
import cors from "cors";

import { CampaignReference } from "@usher.so/partnerships";
import { Campaign, CampaignStrategies } from "@usher.so/campaigns";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { getArangoClient } from "@/utils/arango-client";
import { ceramic } from "@/utils/ceramic-client";
import { REFERRAL_TOKEN_DELIMITER } from "@/constants";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler();

const arango = getArangoClient();

const loader = new TileLoader({ ceramic });

const schema = z.object({
	code: z.string(),
	id: z.string(),
	chain: z.string(),
	eventId: z.number(),
	nativeId: z.string().optional(),
	metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
	commit: z.number().optional()
});

const startSchema = z.object({
	id: z.string(),
	chain: z.string(),
	token: z.string()
});

const isPartnershipStreamValid = (stream: TileDocument<CampaignReference>) => {
	return (
		stream.content.address &&
		stream.content.chain &&
		stream.controllers.length > 0 &&
		stream.metadata.schema === WalletAliases.schemas.Partnership
	);
};

/**
 * GET: Accepts encypted token unique to the Referred User from Advertiser page to produce a Converison code
 * POST: Uses the conversion code to submit conversion data and save a conversion
 */

// Initializing the cors middleware
handler.router
	.use(
		expressMiddleware(
			cors({
				preflightContinue: true
			})
		)
	)
	.get(async (req, res) => {
		let body: z.infer<typeof startSchema>;
		try {
			body = await startSchema.parseAsync(req.query);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { token, id: campaignId, chain: campaignChain } = body;

		if (!token) {
			return res.status(400).json({
				success: false
			});
		}

		const [campaignToken, referralToken] = token.split(".");

		const campaignFromToken = Base64.decode(campaignToken).split(":");

		if (
			campaignFromToken.length === 2
				? campaignId !== campaignFromToken[1] ||
				  campaignChain !== campaignFromToken[0]
				: true
		) {
			req.log.error({ token }, "Could match token to campaign params");
			return res.status(400).json({
				success: false
			});
		}

		const did = await getAppDID();

		let message;
		try {
			const jwe = JSON.parse(Base64.decode(referralToken as string));
			const raw = await did.decryptJWE(jwe);
			message = uint8arrays.toString(raw);
		} catch (e) {
			req.log.error({ token }, "Could not decrypt referral token");
			return res.status(400).json({
				success: false
			});
		}

		const sp = message.split(REFERRAL_TOKEN_DELIMITER);
		const id = sp.shift();
		const partnership = sp.join(REFERRAL_TOKEN_DELIMITER);

		req.log.debug({ token, partnership, id }, "Token is valid");

		// Check the partnership id of the token
		const stream = await loader.load<CampaignReference>(partnership);
		// Validate that the provided partnership is valid
		if (!isPartnershipStreamValid(stream)) {
			req.log.info(
				{
					token,
					partnership,
					streamContent: stream.content,
					schema: stream.metadata.schema,
					modelSchema: WalletAliases.schemas.Partnership
				},
				"Partnership is invalid"
			);
			return res.status(400).json({
				success: false
			});
		}

		req.log.debug({ partnership }, "Partnership is valid");

		// Ensure the Advertiser provided chain and id matches the token's data
		if (
			campaignId !== stream.content.address ||
			campaignChain !== stream.content.chain
		) {
			req.log.info(
				{
					body,
					streamContent: stream.content
				},
				"Payload does not match token"
			);
			return res.status(400).json({
				success: false
			});
		}

		// Once all is valid, sign the message
		const jws = await did.createJWS(message);
		const sig = Base64.encode(JSON.stringify(jws));

		const rawCode = {
			partnership,
			message,
			sig,
			createdAt: Date.now(),
			expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
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
	.post(async (req, res) => {
		// ? This POST request exists to process the conversion after the Network Signature has been fetched.
		// ? It is a separate process because this will eventually be replaced with a syndication to the Validator Network

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

		// Validate that event is not already converted
		const convCheckCursor = await arango.query(aql`
			FOR conversion IN Conversions
			FILTER
					conversion.message == ${raw.message} &&
					conversion.event_id == ${conversion.eventId}
			RETURN conversion
		`);

		const convCheckResult = (await convCheckCursor.all()).filter(
			(result) => !isEmpty(result)
		);
		if (convCheckResult.length !== 0) {
			req.log.error({ vars: { raw } }, "Event already converted");
			return res.status(400).json({
				success: false
			});
		}

		const stream = await loader.load<CampaignReference>(raw.partnership);
		// Validate that the provided partnership is valid
		if (!isPartnershipStreamValid(stream)) {
			req.log.info(
				{
					vars: {
						code,
						raw,
						streamContent: stream.content,
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

		const partnershipId = stream.id.toString();
		const campaignRef = stream.content;

		// Ensure the Advertiser provided chain and id matches the token's data
		if (
			conversion.id !== campaignRef.address ||
			conversion.chain !== campaignRef.chain
		) {
			req.log.info(
				{
					body,
					campaignRef
				},
				"Payload does not match partnership"
			);
			return res.status(400).json({
				success: false
			});
		}

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
			req.log.error(
				{ vars: { campaign, conversion } },
				"Event ID does not exist"
			);
			return res.status(400).json({
				success: false,
				message: "Event ID does not exist"
			});
		}
		const event = campaign.events[conversion.eventId];
		// 2. native_id is unique for that given Campaign and event_id -- unless there is a nativeLimit
		let { rate } = event;
		let { commit } = conversion;
		if (
			typeof conversion.nativeId === "string" &&
			!isEmpty(conversion.nativeId)
		) {
			// Only check for native id related uniqueness if native_id is provided.
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
					req.log.warn(
						{ vars: { campaign, conversion } },
						"Native ID already Converted"
					);
					return res.json({
						success: false,
						message: "Native ID already Converted"
					});
				}
			} else if (typeof commit === "number") {
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
					req.log.warn(
						{ vars: { campaign, conversion } },
						"Native ID already Converted"
					);
					return res.json({
						success: false,
						message: "Native ID already Converted"
					});
				}

				let ratePercentage = 1;
				if (remainingCommittable < commit) {
					commit = remainingCommittable;
					ratePercentage = remainingCommittable / commit;
				}
				rate = ratePercentage * event.rate;
			} else {
				// If nativeLimit is defined, but no commit is defined: (we're being very explicit with requiring commit value)
				// Return an error if the event is configured to recieve values that is does not
				const errMsg = `'nativeLimit' is configured for the Event, but Converison does not include 'commit'`;
				req.log.warn({ vars: { campaign, conversion } }, errMsg);
				return res.json({
					success: false,
					message: errMsg
				});
			}
		}

		// Determine the reward amount ONLY if the campaign is NOT attributable
		let rewards = 0;
		if (campaign.attributable !== true) {
			rewards = rate;
			// Only apply perCommit logic, there is a commit value
			if (typeof event.perCommit === "number" && event.perCommit > 0) {
				if (typeof commit === "number") {
					// This allows for arbitrary commit values to be anything -- and for perCommit to determine a multiplier.
					// ie. for data based reward can be per 1kb by commit (X bytes / 1000 bytes) * rate.
					rewards = rate * (commit / event.perCommit);
				} else {
					// Return an error if the event is configured to recieve values that is does not
					const errMsg = `'perCommit' is configured for Event, but Converison does not include 'commit'`;
					req.log.warn({ vars: { campaign, conversion } }, errMsg);
					return res.json({
						success: false,
						message: errMsg
					});
				}
			}

			// Add Percentage base Rate calculation -- based on amount in metadata
			if (event.strategy === CampaignStrategies.PERCENTAGE) {
				let amount = conversion.metadata?.amount;
				if (typeof amount === "string") {
					amount = parseFloat(amount);
				}
				if (amount && typeof amount === "number") {
					rewards *= amount;
				} else {
					const errMsg = `'amount' missing from 'metadata' for percentage based conversion event`;
					req.log.warn({ vars: { campaign, conversion } }, errMsg);
					return res.json({
						success: false,
						message: errMsg
					});
				}
			}
		}

		// // TODO: Include a process to check remaining rewards -- to determine the rewards to set
		// // Should reflect how the validator nodes should validate conversions.
		// // TODO: Do this inside of a "basis" validator node -- this will speed up the operation of this function too.
		// ? We shouldn't be allocating rewards with the limit in consideration
		// ? Instead, you can earn as many limitless rewards, but may only withdraw up to a limit.

		req.log.info(
			{ vars: { rate, commit, rewards, campaign, conversion } },
			"Saving conversion..."
		);
		// Save the Conversion Data
		// Update the associated Partnership's reward amount
		const saveCursor = await arango.query(aql`
			LET pDoc = DOCUMENT("Partnerships", ${partnershipId})
			INSERT {
				partnership: ${partnershipId},
				message: ${raw.message},
				sig: ${raw.sig},
				event_id: ${conversion.eventId},
				converted_at: ${Date.now()},
				native_id: ${conversion.nativeId || null},
				metadata: ${conversion.metadata || null},
				commit: ${commit || null}
			} INTO Conversions OPTIONS { waitForSync: true }
			LET conversion = NEW
			INSERT {
				_from: pDoc._id,
				_to: conversion._id
			} INTO Referrals OPTIONS { waitForSync: true }
			UPDATE pDoc WITH {
				rewards: SUM([pDoc.rewards, ${rewards}])
			} IN Partnerships OPTIONS { waitForSync: true }
			LET partnership = NEW
			RETURN {
				conversion,
				partnership
			}
		`);

		const saveResults = await saveCursor.all();

		req.log.info({ saveResults }, "Conversion and Partnership Saved!");

		return res.json({
			success: true,
			data: {
				conversion: saveResults[0].conversion._key,
				partnership: saveResults[0].partnership._key
			}
		});
	});

export default handler.cors().handle();
