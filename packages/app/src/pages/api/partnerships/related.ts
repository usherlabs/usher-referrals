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
			LET dids = ${req.user.map(({ did }) => `Dids/${did}`)}
			LET relatedDids = (
				FOR did in dids
					FOR rd IN 1..1 ANY did Related
						COLLECT _id = rd._id
						RETURN _id)
			LET uniquedDids = UNION_DISTINCT(dids, relatedDids)
			FOR did IN uniquedDids
				FOR p IN 1..1 OUTBOUND did Engagements
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
