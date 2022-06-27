import openid from "openid-client";

import {
	publicUrl,
	humanodeClientId,
	humanodeClientSecret
} from "@/server/env-config";

export const getHumanodeOpenIdClient = async () => {
	if (!humanodeClientId || !humanodeClientSecret) {
		throw new Error("Humanode Client Id or Secret is missing");
	}

	// Humanode Issuer a.k.a. Identity provider.
	const humanodeIssuer = await openid.Issuer.discover(
		"https://auth.staging.oauth2.humanode.io"
	);

	// Set up the common hackathon client.
	const client = new humanodeIssuer.Client({
		client_id: humanodeClientId,
		client_secret: humanodeClientSecret,
		redirect_uris: [
			`${publicUrl || "http://localhost:3000"}/api/verify/callback`
		],
		response_types: ["code"],
		token_endpoint_auth_method: "client_secret_post"
	});

	return client;
};
