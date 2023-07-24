import { z } from "zod";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";

import { AuthApiRequest } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import captcha from "@/server/captcha";
import { getArangoClient } from "@/utils/arango-client";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

const schema = z.object({
	token: z.string()
});

const arango = getArangoClient();

handler.router
	.use(withAuth)
	.get(async (req, res) => {
		try {
			// Fetch captcha entry associated to either of the user DIDs
			// Works by: For each verified DID, walk the Verifications edge, Filter where the Result is a Captcha and return the latest entry
			//! IMPORTANT:
			//* Be sure to pass raw javascript variables to the AQL Templates... rather than constructing the Query items
			const cursor = await arango.query(aql`
				FOR d IN ${req.user.map(({ did }) => did)}
					FOR e IN 1..1 OUTBOUND CONCAT("Dids/", d) Verifications
						FILTER STARTS_WITH(e._id, "CaptchaEntries") AND e.success == true
						COLLECT _id = e._id
						LET ce = DOCUMENT(_id)
						SORT ce.created_at DESC
						RETURN ce
			`);

			const results = (await cursor.all()).filter((result) => !isEmpty(result));

			req.log.debug({ results }, "captcha fetch results");

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
	.post(async (req, res) => {
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
					RETURN u.did
			)
			INSERT {
				success: true,
				created_at: ${Date.now()},
				response: ${response}
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

export default handler.handle();
