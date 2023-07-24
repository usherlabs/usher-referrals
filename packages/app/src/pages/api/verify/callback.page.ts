/**
 * Reserved callback URL for use with Humanode OAuth2
 */
import { aql } from "arangojs";
import { parseCookies, setCookie } from "nookies";
import { Base64 } from "js-base64";
import jwtDecode, { JwtPayload } from "jwt-decode";

import { AuthUser } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";
import {
	getHumanodeOpenIdClient,
	getRedirectUri
} from "@/utils/humanode-client";

const arango = getArangoClient();

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler();

handler.router.get(async (req, res) => {
	const client = await getHumanodeOpenIdClient();
	const cookies = parseCookies({ req });

	req.log.debug({ cookies }, "Cookies");

	const { hn_code_verifier: codeVerifier } = cookies;

	// Get callback params with auth code.
	const params = client.callbackParams(req);
	let redir = "/verify/complete";
	let user = null;
	try {
		const state = JSON.parse(params.state ? Base64.decode(params.state) : "{}");
		if (state.redir) {
			redir += `?redir=${state.redir}`;
		}
		user = state.user as AuthUser;
	} catch (e) {
		// ...
	}

	const failureRedir = `/verify/failure`;
	if (user === null) {
		req.log.error("No user for personhood authentication");
		return res.redirect(302, failureRedir);
	}

	// If callback params have an error instead of auth code
	// render error page with description.
	if ("error" in params) {
		req.log.error(params, "Failed to process the Humanode PoP Verification");
		return res.redirect(302, failureRedir);
	}

	req.log.info("Processed the Humanode PoP Verification");

	// Exchange auth code for JWT token.
	const tokenSet = await client.callback(getRedirectUri(), params, {
		state: params.state,
		code_verifier: codeVerifier
	});
	if (!tokenSet.id_token) {
		req.log.error({ tokenSet }, "Failed to extract ID Token from Token Set");
		return res.redirect(302, failureRedir);
	}

	// Save JWT.
	setCookie(
		{ res },
		"hn_access_token",
		Base64.encode(JSON.stringify(tokenSet)),
		{
			maxAge: 30 * 24 * 60 * 60 // 30 days
		}
	);

	// Use the `sub` property to uniquely identify the face.
	const dec = jwtDecode<JwtPayload>(tokenSet.id_token);
	const id = dec.sub;

	req.log.info({ id }, "Personhood verification completed!");

	const dids = user.map(({ did }) => did);

	// Search for personhood entry already associated to this user
	// Start by searching for all DIDs associated to the authenticated DIDs
	// If it the same id -- pass the check
	// If it is a different id -- return error
	const thirdPartyVerifierCursor = await arango.query(aql`
		FOR d IN DOCUMENT("Dids", ${dids})
			FOR did IN 1..100 ANY d Related
        COLLECT _id = did._id
        FOR e IN 1..1 OUTBOUND _id Verifications
					FILTER STARTS_WITH(e._id, "PersonhoodEntries") AND e.success == true
					FILTER e.id != ${id}
					COLLECT v_id = e._id
					LET entry = DOCUMENT(v_id)
					SORT entry.created_at DESC
					RETURN entry
	`);

	const thirdPartyVerifierResults = await thirdPartyVerifierCursor.all();
	if (thirdPartyVerifierResults.length > 0) {
		req.log.warn(
			{ id, thirdPartyVerifierResults },
			"User/Account already verified by a third-party"
		);
		return res.redirect(302, failureRedir);
	}

	// Search for this personhood verify id where it is NOT associated to this user
	// ? This will return a set of DIDs that are NOT associated to the authenticated user, but are related to the verified person
	// ? Indicates that the verified user has verified for another set of DIDs
	// If this person has already verified for another account -- return error
	const searchCursor = await arango.query(aql`
		LET dids = (
			FOR d IN DOCUMENT("Dids", ${dids})
				FOR did IN 1..100 ANY d Related
					COLLECT _id = did._id
					LET doc = DOCUMENT(_id)
					RETURN doc._key
		)
		FOR p IN PersonhoodEntries
			FILTER p.id == ${id}
			FOR did IN 1..1 INBOUND p Verifications
				FILTER POSITION(dids, did._key) == false
					RETURN did
	`);

	// If searchResults yields dids, then this person has already verified for another (account) set dids
	const searchResults = await searchCursor.all();
	if (searchResults.length > 0) {
		req.log.warn(
			{ id, nonAssociatedDids: searchResults },
			"Person has already verified for a set of unauthenticated dids"
		);
		return res.redirect(302, failureRedir);
	}

	// Save Personhood result to the DB
	const cursor = await arango.query(aql`
		LET dids = ${dids}
		INSERT {
			"success": true,
			"created_at": ${Date.now()},
			"id": ${id},
			"response": ${tokenSet}
		}
		INTO PersonhoodEntries OPTIONS { waitForSync: true }
		LET inserted = NEW
		LET edges = (
			FOR d IN dids
				INSERT {
					_from: CONCAT("Dids/", d),
					_to: CONCAT("PersonhoodEntries/", inserted._key)
				} INTO Verifications
				RETURN NEW
		)
		RETURN {
			inserted: inserted,
			edges: edges
		}
	`);

	const results = await cursor.all();
	req.log.info({ results }, "Personhood entry saved");

	// Redirect end-user to root route.
	return res.redirect(302, redir);
});

export default handler.handle();
