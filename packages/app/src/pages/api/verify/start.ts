/**
 * Reserved for the /verify/start page
 */
import { setCookie } from "nookies";
import openid from "openid-client";
import { Base64 } from "js-base64";

import { AuthApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import { getHumanodeOpenIdClient } from "@/utils/humanode-client";
import withAuth from "@/server/middleware/auth";

const handler = getHandler();

handler.use(withAuth).get(async (req: AuthApiRequest, res: ApiResponse) => {
	const { redir } = req.query;
	const dids = req.user.map(({ did }) => did);
	const client = await getHumanodeOpenIdClient();

	// Set up codeVerifier and save it as a cookie for later use.
	const codeVerifier = openid.generators.codeVerifier(64);
	setCookie({ res }, "hn_code_verifier", codeVerifier, {
		maxAge: 60 * 60
	});

	// Set up codeChallenge for login flow.
	const codeChallenge = openid.generators.codeChallenge(codeVerifier);

	// Get the redirect URI.
	const redirectUri = client.authorizationUrl({
		scope: "openid",
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		state: Base64.encodeURI(JSON.stringify({ redir, dids })) // can be some arbitrary state
	});

	return res.json({
		success: true,
		redirectUri
	});
});

export default handler;
