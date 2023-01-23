import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import cors from "cors";

// import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";
// import { getArangoClient } from "@/utils/arango-client";
import { dummyData } from "@/programs/collections/types";

const handler = useRouteHandler<AuthApiRequest>();

// const arango = getArangoClient();

handler.router
	.use(
		expressMiddleware(
			cors({
				preflightContinue: true
			})
		)
	)
	// .use(withAuth)
	.get(async (req, res) => {
		try {
			const linkIds = new Set(dummyData.hits.map((hit) => hit.linkId));

			const results = [...linkIds].map((linkId) => {
				const hits = dummyData.hits.filter(
					(hit) => hit.linkId === linkId
				).length;
				const redirects = dummyData.redirects.filter(
					(redirect) => redirect.linkId === linkId
				).length;
				return {
					id: linkId,
					hits,
					redirects
				};
			});

			// const cursor = await arango.query(aql`
			// `);

			// const results = (await cursor.all()).filter((result) => !isEmpty(result));

			// req.log.debug({ results }, "related partnerships fetch results");

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

export default handler.cors().handle();
