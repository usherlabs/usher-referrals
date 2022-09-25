import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";

import { AuthApiRequest } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getArangoClient } from "@/utils/arango-client";

const handler = useRouteHandler<AuthApiRequest>();

const arango = getArangoClient();

/**
 * GET: Partnerships related to the authenticated DIDs
 */
handler.router.use(withAuth).get(async (req, res) => {
	try {
		const cursor = await arango.query(aql`
			FOR d IN DOCUMENT("Dids", ${req.user.map(({ did }) => did)})
				FOR did IN 1..1 ANY d Related
					COLLECT _id = did._id
					FOR p IN 1..1 OUTBOUND _id Engagements
						FILTER STARTS_WITH(p._id, "Partnerships")
						FOR c IN 1..1 OUTBOUND p Engagements
							FILTER STARTS_WITH(c._id, "Campaigns")
							COLLECT _caddress = c.id, _cchain = c.chain, _pid = p._key
							RETURN {
								id: _pid,
								campaign: {
									chain: _cchain,
									address: _caddress
								}
							}
		`);

		const results = (await cursor.all()).filter((result) => !isEmpty(result));

		req.log.debug({ results }, "related partnerships fetch results");

		return res.json({
			success: true,
			data: results
		});
	} catch (e) {
		req.log.error(e);
		return res.status(400).json({
			success: false
		});
	}
});

export default handler.handle();
