import cors from "cors";

import { fetchConnectionsByLink } from "@/server/connections";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

handler.router
	.use(
		expressMiddleware(
			cors({
				preflightContinue: true
			})
		)
	)
	.use(withAuth)
	.get(async (req, res) => {
		const { id } = req.query;

		if (typeof id !== "string") {
			return res.status(400).json({
				success: false
			});
		}

		try {
			const dids = req.user.map(({ did }) => did);
			const results = await fetchConnectionsByLink(id, dids);

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
