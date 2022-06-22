/**
 * Reserved callback URL for use with Humanode OAuth2
 */
import { aql } from "arangojs";
import { setCookie, parseCookies } from "nookies";

import { publicUrl } from "@/server/env-config";
import { AuthApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";
import { getHumanodeOpenIdClient } from "@/utils/humanode-client";

const handler = getHandler();

const arango = getArangoClient();

handler.get(async (req: AuthApiRequest, res: ApiResponse) => {
	const client = await getHumanodeOpenIdClient();
	const cookies = parseCookies();
	req.log.debug({ cookies }, "Cookies");
	const { hn_code_verifier: codeVerifier } = cookies;

	// Get callback params with auth code.
	const params = client.callbackParams(req);
	let redir = "/";
	try {
		const state = JSON.parse(params.state || "{}");
		if (state.redir) {
			redir = state.redir;
		}
	} catch (e) {
		// ...
	}

	// If callback params have an error instead of auth code
	// render error page with description.
	if ("error" in params) {
		req.log.error(params, "Failed to process the Humanode PoP Verification");
		return res.redirect(302, redir);
	}

	req.log.info("Processed the Humanode PoP Verification");

	// Exchange auth code for JWT token.
	const tokenSet = await client.callback(
		`${publicUrl || "http://localhost:3000"}/api/verify/callback`,
		params,
		{ state: params.state, code_verifier: codeVerifier }
	);
	// Save JWT.
	setCookie({ res }, "hn_access_token", JSON.stringify(tokenSet), {
		maxAge: 30 * 24 * 60 * 60 // 30 days
	});
	// Redirect end-user to root route.
	return res.redirect(302, redir);

	// const response = {}; // TODO: Store Verification Response

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

	// return res.json({
	// 	success: false
	// });
});

export default handler;
