import { Chains, Connections } from "@usher.so/shared";
import cors from "cors";
import { z } from "zod";

import { createLinkConnection } from "@/server/connections";
import { incrementLinkRedirects } from "@/server/link";
import { expressMiddleware, useRouteHandler } from "@/server/middleware";
import { createWallet, fetchWallet, updateWallet } from "@/server/wallet";

const postSchema = z.object({
	chain: z.nativeEnum(Chains),
	address: z.string(),
	connection: z.nativeEnum(Connections)
});

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
		let body: z.infer<typeof postSchema>;
		try {
			body = await postSchema.parseAsync(req.body);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { chain, address, connection } = body;

		try {
			const { id: linkkey } = req.query;
			if (typeof linkkey !== "string") {
				throw new Error("id is not a string");
			}

			let wallet = await fetchWallet(chain, address);
			if (!wallet) {
				wallet = await createWallet(chain, address, [connection]);
			} else if (!wallet.connections.includes(connection)) {
				wallet = await updateWallet(chain, address, [
					...wallet.connections,
					connection
				]);
			}

			await createLinkConnection(linkkey, wallet._key, connection);
			await incrementLinkRedirects(linkkey);

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
