import { aql } from "arangojs";

import { AuthApiRequest } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getArangoClient } from "@/utils/arango-client";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

const arango = getArangoClient();

handler.router.use(withAuth).get(async (req, res) => {
	try {
		// Fetch personhood entry related to provided authenticated dids
		// Works by: For each verified DID, walk the captcha edge and return the latest entry
		const cursor = await arango.query(aql`
			FOR d IN DOCUMENT("Dids", ${req.user.map(({ did }) => did)})
				FOR did IN 1..1 ANY d Related
					COLLECT _id = did._id
					FOR e IN 1..1 OUTBOUND _id Verifications
						FILTER STARTS_WITH(e._id, "PersonhoodEntries") AND e.success == true
						COLLECT v_id = e._id
						LET entry = DOCUMENT(v_id)
						SORT entry.created_at DESC
						RETURN entry
		`);

		const results = await cursor.all();

		req.log.debug({ results }, "personhood fetch results");

		if (results.length > 0) {
			return res.json({
				success: true,
				createdAt: results[0].created_at
			});
		}
		return res.json({
			success: false
		});
	} catch (e) {
		req.log.error(e);
		return res.status(400).json({
			success: false
		});
	}
});

export default handler.handle();
