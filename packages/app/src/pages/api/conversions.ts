import { z } from "zod";
import { Base64 } from "js-base64";
import cors from "cors";
import * as uint8arrays from "uint8arrays";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";
import { TileLoader } from "@glazed/tile-loader";
import { ShareableOwnerModel } from "@usher/ceramic";

import { ApiResponse, ApiRequest } from "@/types";
import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getAppDID } from "@/server/did";
import { getArangoClient } from "@/utils/arango-client";
import { ceramic } from "@/utils/ceramic-client";

const handler = getHandler();

const arango = getArangoClient();

const loader = new TileLoader({ ceramic });

const schema = z.object({
	code: z.string()
});

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

		const checkResult = (await checkCursor.all()).map(
			(result) => !isEmpty(result)
		);
		if (checkResult.length === 0) {
			req.log.error(
				{ token, id, partnership, checkResult },
				"Conversion does not exisit within index"
			);
			return res.status(400).json({
				success: false
			});
		}

		// Check the partnership id of the token
		const stream = await loader.load(partnership);
		// Validate that the provided partnership is valid
		if (
			!(
				stream.content.address &&
				stream.content.chain &&
				stream.controllers.length > 0 &&
				stream.metadata.schema === ShareableOwnerModel.schemas.partnership
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
			sig
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
		const { code } = body;
		const did = await getAppDID();

		// Destruct the code and verify the signature against the message
		let raw: {
			id: string;
			partnership: string;
			message: string;
			sig: string;
		};
		try {
			const jwe = JSON.parse(Base64.decode(code));
			const rawBytes = await did.decryptJWE(jwe);
			const rawEncoded = uint8arrays.toString(rawBytes); // base64 string
			raw = JSON.parse(Base64.decode(rawEncoded));

			const jws = JSON.parse(Base64.decode(raw.sig));
			await did.verifyJWS(jws, { issuer: did.id });
		} catch (e) {
			req.log.error("Could not destruct and verify code");
			return res.status(400).json({
				success: false
			});
		}

		// Validate the Conversion Data
		// Save the Conversion Data
		// Update the associated Partnership's reward amount

		return res.json({
			success: false // assume all visitors are bots
		});
	});

export default handler;
