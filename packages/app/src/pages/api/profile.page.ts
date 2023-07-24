import { z } from "zod";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";
import camelcaseKeys from "camelcase-keys";

import { AuthApiRequest, Profile } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getArangoClient } from "@/utils/arango-client";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

// See Profile Type
const schema = z.object({
	email: z.string() // ? could be optional in the future
});

const arango = getArangoClient();

handler.router
	.use(withAuth)
	.get(async (req, res) => {
		try {
			const cursor = await arango.query(aql`
				FOR d IN ${req.user.map(({ did }) => did)}
					FOR e IN 1..1 OUTBOUND CONCAT("Dids/", d) Engagements
						FILTER STARTS_WITH(e._id, "Profiles")
						COLLECT _id = e._id
						LET p = DOCUMENT(_id)
						SORT p.created_at DESC
						LET profile = KEEP(p, ATTRIBUTES(p, true))
						RETURN profile
			`);

			const results = (await cursor.all()).filter((result) => !isEmpty(result));

			req.log.debug({ results }, "profile fetch results");

			let profile: Profile = { email: "" };
			if (results.length > 0) {
				[profile] = results;
			}

			return res.json({
				success: results.length > 0,
				profile: camelcaseKeys(profile, { deep: true })
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

		req.log.info("Start profile save");

		// Save Captcha result to the DB
		const cursor = await arango.query(aql`
			LET user = ${req.user}
			LET dids = (
				FOR u IN user
					RETURN u.did
			)
			LET profileKey = (
				FOR d IN dids
					FOR e IN 1..1 OUTBOUND CONCAT("Dids/", d) Engagements
						FILTER STARTS_WITH(e._id, "Profiles")
						SORT e.created_at DESC
						RETURN e._key
			)
			UPSERT { _key: profileKey[0] }
			INSERT ${{ ...body, created_at: Date.now() }}
			UPDATE ${body}
			IN Profiles OPTIONS { waitForSync: true }
			LET inserted = NEW
			LET edges = (
				FOR d IN dids
					LET did = CONCAT("Dids/", d)
					LET edge = (
						FOR r IN Engagements
								FILTER r._from == did AND r._to == inserted._id
								RETURN r
					)
					FILTER COUNT(edge) == 0
						INSERT {
							_from: did,
							_to: inserted._id
						} INTO Engagements
						RETURN NEW
			)
			RETURN {
				inserted: inserted,
				edges: edges
			}
		`);

		const results = await cursor.all();
		req.log.info({ results }, "Profile saved");

		return res.json({
			success: true
		});
	});

export default handler.handle();
