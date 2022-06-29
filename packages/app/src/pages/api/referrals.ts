import { z } from "zod";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";
import { ShareableOwnerModel } from "@usher/ceramic";
import isEmpty from "lodash/isEmpty";

import { ApiResponse, ApiRequest, CampaignReference } from "@/types";
import getHandler from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();

const schema = z.object({
	partnership: z.string(),
	token: z.string().optional()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

/**
 * POST: Create a new referral or verifies the extension of a referral
 */
handler.post(async (req: ApiRequest, res: ApiResponse) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { partnership, token } = body;
	const did = await getAppDID();

	const stream = await loader.load(partnership);
	const campaignRef = stream.content as CampaignReference;
	const [controller] = stream.controllers;

	// Validate that the provided partnership is valid
	if (
		!(
			campaignRef.address &&
			campaignRef.chain &&
			controller &&
			stream.metadata.schema === ShareableOwnerModel.schemas.partnership
		)
	) {
		req.log.info(
			{
				partnership,
				campaignRef,
				controller,
				schema: stream.metadata.schema,
				modelSchema: ShareableOwnerModel.schemas.partnership
			},
			"Partnership is invalid"
		);
		return res.status(400).json({
			success: false
		});
	}

	if (token) {
		try {
			const jwe = JSON.parse(Base64.decode(token));
			const raw = await did.decryptJWE(jwe);
			const sp = uint8arrays.toString(raw).split(".");
			// const referralId =
			sp.shift();
			const partnershipIdFromToken = sp.join(".");
			if (partnershipIdFromToken === partnership) {
				return res.json({
					success: true,
					data: {
						isNew: false,
						token
					}
				});
			}
		} catch (e) {
			req.log.warn(
				{ token, partnership },
				"Could not decrypt conversion cookie token"
			);
		}
	}

	// Ensure that the partnership has been indexed
	const checkCursor = await arango.query(aql`
		RETURN DOCUMENT("Partnerships", ${partnership})
	`);
	const checkResults = (await checkCursor.all()).map(
		(result) => !isEmpty(result)
	);
	if (checkResults.length > 0) {
		req.log.info(
			{ partnership, results: checkResults },
			"Partnership already indexed"
		);
	} else {
		req.log.info({ partnership }, "Creating Partnership...");
		const cursor = await arango.query(aql`
			INSERT {
				_key: ${stream.id.toString()},
				rewards: 0
			} INTO Partnerships OPTIONS { waitForSync: true }
			LET p = NEW
			INSERT {
				_from: p._id,
				_to: ${`Campaigns/${[campaignRef.chain, campaignRef.address].join(":")}`}
			} INTO Engagements OPTIONS { waitForSync: true }
			LET ce = NEW
			UPSERT { _key: ${controller} }
			INSERT { _key: ${controller}, created_at: ${Date.now()} }
			UPDATE {}
			IN Dids OPTIONS { waitForSync: true }
			INSERT {
				_from: CONCAT("Dids/", ${controller}),
				_to: p._id
			} INTO Engagements OPTIONS { waitForSync: true }
			LET pe = NEW
			RETURN {
				partnership: p,
				campaignEngagement: ce,
				parternshipEngagement: pe
			}
		`);

		const results = await cursor.all();
		req.log.info({ results }, "Partnership indexed");
	}

	// Create the conversion and the referral edge
	const cursor = await arango.query(aql`
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

	const results = await cursor.all();

	const [{ conversion }] = results;
	const conversionId = conversion._key;

	const raw = [conversionId, partnership].join(".");
	const jwe = await did.createJWE(uint8arrays.fromString(raw), [did.id]);
	const newToken = Base64.encode(JSON.stringify(jwe));

	return res.json({
		success: false,
		data: {
			isNew: true,
			token: newToken
		}
	});
});

export default handler;
