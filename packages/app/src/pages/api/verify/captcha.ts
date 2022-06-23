import { z } from "zod";
import { aql } from "arangojs";

import { AuthApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import captcha from "@/server/captcha";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();

const schema = z.object({
	token: z.string()
});

const arango = getArangoClient();

handler
	.use(withAuth)
	.get(async (req: AuthApiRequest, res: ApiResponse) => {
		try {
			// Fetch captcha entry associated to either of the user DIDs
			// Works by: For each verified DID, walk the captcha edge and return the latest entry
			// TODO: Test these queries.
			console.log(`
			FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
			FOR e IN 1..1 OUTBOUND d Verification
				FILTER e.success == true
				SORT e.created_at DESC
				LIMIT 1
				RETURN e
			`);
			const cursor = await arango.query(aql`
				FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
					FOR e IN 1..1 OUTBOUND d Verifications
						FILTER e.success == true
						SORT e.created_at DESC
						LIMIT 1
						RETURN e
			`);

			const results = await cursor.all();

			return res.json({
				success: results.length > 0
			});
		} catch (e) {
			req.log.error(e);
			return res.json({
				success: false
			});
		}
	})
	.post(async (req: AuthApiRequest, res: ApiResponse) => {
		let { body } = req;
		try {
			body = await schema.parseAsync(body);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { token } = body;

		req.log.info(
			{ params: { token } },
			"Authenticated-user Bot Prevention Captcha verification"
		);

		if (!token) {
			return res.status(400).json({
				success: false
			});
		}

		const response: { success: boolean } = await captcha(token);

		req.log.info({ captcha: { response } }, "Captcha response");

		// Save Captcha result to the DB
		const cursor = await arango.query(aql`
			INSERT {
				"success": true,
				"created_at": ${Date.now()},
				"response": "${JSON.stringify(response)}"
			}
			INTO CaptchaEntries
			LET inserted = NEW
			FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
				INSERT {
					_from: CONCAT("Dids/", d._key),
					_to: CONCAT("CaptchaEntries/", inserted._key)
				} INTO Verifications
				RETURN NEW
		`);

		const results = await cursor.all();
		req.log.info({ results }, "Captcha entry saved");

		return res.json({
			success: response.success
		});
	});

export default handler;
