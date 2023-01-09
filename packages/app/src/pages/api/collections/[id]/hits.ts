import { dummyData } from "@/components/Collection/types";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
// import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";
import cors from "cors";

const handler = useRouteHandler<AuthApiRequest>();

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
			const hist =
				typeof id === "string"
					? dummyData.hits.filter((hit) => hit.linkId === id)
					: dummyData.hits;

			return res.json({
				success: true,
				data: hist
			});
		} catch (e) {
			req.log.error(e);
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.cors().handle();
