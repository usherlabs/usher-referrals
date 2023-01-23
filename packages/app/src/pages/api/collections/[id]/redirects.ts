import cors from "cors";
import cuid from "cuid";
import { z } from "zod";

import { dummyData, LinkRedirect } from "@/programs/collections/types";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import { Connections } from "@usher.so/shared";

const postSchema = z.object({
	connection: z.nativeEnum(Connections),
	address: z.string()
});

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
		let body: z.infer<typeof postSchema>;
		try {
			body = await postSchema.parseAsync(req.body);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}

		try {
			const { id: linkId } = req.query;
			if (typeof linkId !== "string") {
				throw new Error("id is not a string");
			}

			const redirect: LinkRedirect = {
				id: cuid(),
				linkId,
				connection: body.connection,
				address: body.address,
				lastActivityAt: new Date().getTime()
			};

			dummyData.redirects.push(redirect);

			return res.json({
				success: true,
				data: redirect
			});
		} catch (e) {
			req.log.error(e);
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.cors().handle();
