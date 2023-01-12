import { z } from "zod";
// import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";
import cors from "cors";

import { dummyData, Link } from "@/components/Collection/types";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import { Connections } from "@usher.so/shared";

const postSchema = z.object({
	title: z.string(),
	destinationUrl: z.string(),
	connections: z.array(z.nativeEnum(Connections))
});

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
		try {
			const { links } = dummyData;

			return res.json({
				success: true,
				data: links
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

			const maxId = dummyData.links.reduce(
				(a, b) => Math.max(a, parseInt(b.id, 10)),
				0
			);

			const link: Link = {
				id: (maxId + 1).toString(),
				title: body.title,
				destinationUrl: body.destinationUrl,
				publicUrl: body.destinationUrl,
				connections: body.connections,
				createdAt: new Date().getTime(),
				hits: 0
			};

			dummyData.links.push(link);
			const success = true;

			return res.json({
				success
			});
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.cors().handle();
