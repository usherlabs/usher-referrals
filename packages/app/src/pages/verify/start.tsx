import { GetServerSideProps } from "next";
import openid from "openid-client";
import { setCookie } from "nookies";

import { getHumanodeOpenIdClient } from "@/utils/humanode-client";

const VerifyStart = () => {
	return null;
};

/**
 * 1. Create a pending conversion
 * 2. Store that conversion id in the cookie
 * 3. Redirect to Advertiser Affiliate Referral URL
 *
 * @return  {Object}  props
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const {
		res,
		query: { redir }
	} = ctx;
	const client = await getHumanodeOpenIdClient();

	// Set up codeVerifier and save it as a cookie for later use.
	const codeVerifier = openid.generators.codeVerifier(64);
	setCookie(ctx, "hn_code_verifier", codeVerifier, {
		maxAge: 60 * 60
	});

	// Set up codeChallenge for login flow.
	const codeChallenge = openid.generators.codeChallenge(codeVerifier);

	// Get the redirect URI.
	const redirectUri = client.authorizationUrl({
		scope: "openid",
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		state: JSON.stringify({ redir }) // can be some arbitrary state
	});

	res.writeHead(302, {
		Location: redirectUri
	});
	res.end();

	return { props: {} };
};

export default VerifyStart;
