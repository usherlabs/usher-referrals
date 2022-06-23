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
			const cursor = await arango.query(aql`
				FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
					FOR e IN 1..1 OUTBOUND d Verifications
						FILTER STARTS_WITH(e._to, "CaptchaEntries/")
						LET c = DOCUMENT("CaptchaEntries/", e._to)
						SORT c.created_at DESC
						LIMIT 1
						RETURN e
			`);

			const results = await cursor.all();

			return res.json({
				success: results.length > 0
			});
		} catch (e) {
			req.log.error(e);
			return res.status(400).json({
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
			LET user = ${req.user}
			LET dids = (
				FOR u IN user
					UPSERT { _key: u.did }
					INSERT { _key: u.did, wallet: u.wallet }
					UPDATE { wallet: u.wallet }
					IN Dids OPTIONS { waitForSync: true }
					RETURN u.did
			)
			INSERT {
				success: true,
				created_at: ${Date.now()},
				response: ${JSON.stringify(response)}
			}
			INTO CaptchaEntries OPTIONS { waitForSync: true }
			LET inserted = NEW
			LET edges = (
				FOR d IN dids
					INSERT {
						_from: CONCAT("Dids/", d),
						_to: CONCAT("CaptchaEntries/", inserted._key)
					} INTO Verifications
					RETURN NEW
			)
			RETURN {
				inserted: inserted,
				edges: edges
			}
		`);

		const results = await cursor.all();
		req.log.info({ results }, "Captcha entry saved");

		return res.json({
			success: response.success
		});
	});

export default handler;
