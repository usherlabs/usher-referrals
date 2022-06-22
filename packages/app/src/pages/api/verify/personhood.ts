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

handler.use(withAuth).post(async (req: AuthApiRequest, res: ApiResponse) => {
	let { body } = req;
	try {
		body = await schema.parseAsync(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { token } = body;

	req.log.info(
		{ params: { token } },
		"Authenticated-user Personhood verification"
	);

	if (!token) {
		return res.status(400).json({
			success: false
		});
	}

	const response = {}; // TODO: Get Verification Response

	// req.log.info(
	// 	{ personhood: { response } },
	// 	"Personhood verification response"
	// );

	// // Save Captcha result to the DB
	// const cursor = await arango.query(aql`
	// 	INSERT {
	// 		"success": true,
	// 		"created_at": ${Date.now()},
	// 		"response": "${JSON.stringify(response)}"
	// 	}
	// 	INTO CaptchaEntries
	// 	LET inserted = NEW
	// 	FOR d IN DOCUMENT("Dids", [${req.user.map(({ did }) => `"${did}"`).join(", ")}])
	// 		INSERT {
	// 			_from: CONCAT("Dids/", d._key),
	// 			_to: CONCAT("CaptchaEntries/", inserted._key)
	// 		} INTO CaptchaEntry
	// 		RETURN NEW
	// `);

	// const results = await cursor.all();
	// req.log.info({ results }, "Captcha entry saved");

	return res.json({
		success: false
	});
});

export default handler;
