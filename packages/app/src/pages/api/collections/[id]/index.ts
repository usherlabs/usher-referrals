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
		const { id } = req.query;
		try {
			const results = dummyData.hits
				.filter((hit) => hit.linkId === id)
				.map((hit) => {
					const redirect = dummyData.redirects.find(
						(r) => r.linkId === hit.linkId
					);

					return {
						id: hit.id,
						linkId: hit.linkId,
						hitAt: hit.hitAt,
						connection: redirect?.connection,
						address: redirect?.address,
						lastActivityAt: redirect?.lastActivityAt
					};
				});

			// const cursor = await arango.query(aql`
			// `);

			// const results = (await cursor.all()).filter((result) => !isEmpty(result));

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
