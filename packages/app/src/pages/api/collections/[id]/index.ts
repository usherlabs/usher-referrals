import cors from "cors";
import { z } from "zod";

import { dummyData } from "@/programs/collections/types";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
// import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";
import { Connections } from "@usher.so/shared";

const putSchema = z.object({
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
		const { id } = req.query;

		try {
			const links =
				typeof id === "string"
					? dummyData.links.filter((link) => link.id === id)
					: dummyData.links;

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
	.put(async (req, res) => {
		const { id } = req.query;
		let body: z.infer<typeof putSchema>;

		try {
			body = await putSchema.parseAsync(req.body);

			const linkIndex = dummyData.links.findIndex((link) => link.id === id);

			const link = {
				...dummyData.links[linkIndex],
				...body
			};

			dummyData.links[linkIndex] = link;

			const success = true;

			return res.json({
				success
			});
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
	})
	.delete(async (req, res) => {
		const { id } = req.query;

		try {
			const linkIndex = dummyData.links.findIndex((link) => link.id === id);

			dummyData.links.splice(linkIndex, 1);

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
