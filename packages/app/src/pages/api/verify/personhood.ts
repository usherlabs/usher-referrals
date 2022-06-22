import { z } from "zod";
import { aql } from "arangojs";

import { AuthApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();

const schema = z.object({
	token: z.string()
});

const arango = getArangoClient();

handler.use(withAuth).get(async (req: AuthApiRequest, res: ApiResponse) => {
	try {
		// Fetch captcha entry associated to either of the user DIDs
		// Works by: For each verified DID, walk the captcha edge and return the latest entry
		// TODO: Test these queries.
		// console.log(`
		// FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
		// FOR e IN 1..1 OUTBOUND d Verification
		// 	FILTER e.success == true
		// 	SORT e.created_at DESC
		// 	LIMIT 1
		// 	RETURN e
		// `);
		// const cursor = await arango.query(aql`
		// 	FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
		// 		FOR e IN 1..1 OUTBOUND d Verification
		// 			FILTER e.success == true
		// 			SORT e.created_at DESC
		// 			LIMIT 1
		// 			RETURN e
		// `);

		// const results = await cursor.all();

		return res.json({
			success: false
		});
	} catch (e) {
		req.log.error(e);
		return res.json({
			success: false
		});
	}
});

export default handler;
