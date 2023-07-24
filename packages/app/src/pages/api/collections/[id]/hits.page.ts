import cors from "cors";

import { incrementLinkHits } from "@/server/link";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler();

handler.router
	.use(
		expressMiddleware(
			cors({
				preflightContinue: true
			})
		)
	)
	.post(async (req, res) => {
		try {
			const { id: linkId } = req.query;
			if (typeof linkId !== "string") {
				throw new Error("id is not a string");
			}

			await incrementLinkHits(linkId);

			return res.json({
				success: true
			});
		} catch (e) {
			req.log.error(e);
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.cors().handle();
