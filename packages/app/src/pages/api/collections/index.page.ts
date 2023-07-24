import cors from "cors";
import { z } from "zod";

import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import { fetchLinkStats, indexLink } from "@/server/link";
import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

const postSchema = z.object({
	linkId: z.string()
});

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
		try {
			const dids = req.user.map(({ did }) => did);

			const results = await fetchLinkStats(dids);

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
	})
	.post(async (req, res) => {
		let body: z.infer<typeof postSchema>;
		try {
			body = await postSchema.parseAsync(req.body);
			const [did] = req.user.map(({ did: d }) => d);
			const { linkId } = body;

			await indexLink(linkId, did, req.log);

			return res.json({
				success: true
			});
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.cors().handle();
