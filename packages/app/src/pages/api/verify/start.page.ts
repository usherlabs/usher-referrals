/**
 * Reserved for the /verify/start page
 */
import { setCookie } from "nookies";
import openid from "openid-client";
import { Base64 } from "js-base64";

import { AuthApiRequest } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getHumanodeOpenIdClient } from "@/utils/humanode-client";
import withAuth from "@/server/middleware/auth";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();

handler.router.use(withAuth).get(async (req, res) => {
	const { redir } = req.query;
	const client = await getHumanodeOpenIdClient();

	// Set up codeVerifier and save it as a cookie for later use.
	const codeVerifier = openid.generators.codeVerifier(64);
	setCookie({ res }, "hn_code_verifier", codeVerifier, {
		maxAge: 30 * 24 * 60 * 60 // 30 days
	});

	// Set up codeChallenge for login flow.
	const codeChallenge = openid.generators.codeChallenge(codeVerifier);

	// Get the redirect URI.
	const redirectUri = client.authorizationUrl({
		scope: "openid",
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		state: Base64.encodeURI(
			JSON.stringify({
				redir,
				user: req.user
			})
		) // can be some arbitrary state
	});

	return res.json({
		success: true,
		redirectUri
	});
});

export default handler.handle();
