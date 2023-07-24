import { z } from "zod";

import { useRouteHandler } from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { AuthApiRequest } from "@/types";
import withAuth from "@/server/middleware/auth";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

const schema = z.object({
	path: z.string()
});

handler.router.use(withAuth).get(async (req, res) => {
	let { query } = req;
	try {
		query = await schema.parseAsync(query);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { path: revalidatePath } = query;

	const did = await getAppDID();
	const userDids = req.user.map(({ did: d }) => d);

	if (!userDids.includes(did.id)) {
		return res.status(401).json({ message: "Invalid user" });
	}

	try {
		// this should be the actual path not a rewritten path
		// e.g. for "/blog/[slug]" this should be "/blog/post-1"
		await res.revalidate(revalidatePath as string);
		return res.json({ revalidated: true });
	} catch (err) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		return res.status(500).send("Error revalidating");
	}
});

export default handler.handle();
