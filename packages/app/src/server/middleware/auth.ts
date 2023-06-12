import { Base64 } from "js-base64";
import { DagJWS, DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import isEmpty from "lodash/isEmpty";
import { aql } from "arangojs";
import { ArangoError } from "arangojs/error";
import type { NextHandler } from "next-connect";
// import util from "util";
import { getArangoClient } from "@/utils/arango-client";
import { ApiResponse, AuthApiRequest } from "@/types";

const arango = getArangoClient();

const verify = async (did: string, sig: DagJWS): Promise<boolean> => {
	const instance = new DID({
		resolver: {
			...getKeyResolver()
		}
	});
	const result = await instance.verifyJWS(sig, { issuer: did });
	// console.log(`verification`, util.inspect(result, false, null, true));
	if (result.kid) {
		return true;
	}

	return false;
};

const withAuth = async (
	req: AuthApiRequest,
	res: ApiResponse,
	next: NextHandler
) => {
	if (!req.token) {
		req.log.debug("No token provided");
		return res.status(403).json({
			success: false
		});
	}
	let payload;
	try {
		payload = JSON.parse(Base64.decode(req.token));
	} catch (e) {
		req.log.debug("Failed to parse token");
		return res.status(403).json({
			success: false
		});
	}

	// Payload is an array of dids and their respective signature
	try {
		const user = (
			await Promise.all(
				payload.map(
					async ([did, sig, wallet]: [
						string,
						DagJWS,
						string[] | undefined
					]) => {
						try {
							const verified = await verify(did, sig);
							if (verified) {
								return {
									did,
									wallet: wallet
										? {
												chain: wallet[0],
												address: wallet[1]
										  }
										: null
								};
							}
						} catch (e) {
							//* This will fail if the Signature Payload includes sepcial characters
							req.log.debug(
								{ error: e, did, sig, wallet },
								"Cannot verify JWS for DID"
							);
						}
						return null;
					}
				)
			)
		).filter((did) => typeof did !== null && !isEmpty(did));

		if (user.length === 0) {
			req.log.debug("No user loaded");
			return res.status(403).json({
				success: false
			});
		}

		req.user = user;

		req.log.debug({ user: req.user }, "User auth request");

		try {
			// ? Here we simply update the authenticated dids with data, and ensure there are relations between dids.
			// ? If Dids associated to two clusters of Dids are authenticated, then those clusters will have a relation
			await arango.query(
				aql`
					LET user = ${req.user}
					LET dids = (
						FOR u IN user
							UPSERT { _key: u.did }
							INSERT { _key: u.did, wallet: u.wallet, created_at: ${Date.now()} }
							UPDATE { wallet: u.wallet }
							IN Dids OPTIONS { waitForSync: true }
							RETURN u.did
					)
					FOR a IN dids
						FOR b IN dids
							FILTER a != b
							LET didA = CONCAT("Dids/", a)
							LET didB = CONCAT("Dids/", b)
							LET edge = (
									FOR r IN Related
											FILTER r._from == didA AND r._to == didB
											RETURN r
							)
							FILTER COUNT(edge) == 0
								INSERT {
									_from: didA,
									_to: didB
								} INTO Related OPTIONS { waitForSync: true }
								RETURN NEW
				`
			);
		} catch (e) {
			if (e instanceof ArangoError && e.errorNum === 1200) {
				req.log.warn({ conflictErr: e }, "Arango Conflict Error");
			} else {
				throw e;
			}
		}

		req.log.debug("User indexed");

		return next();
	} catch (e) {
		req.log.error(e);
		return res.status(403).json({
			success: false
		});
	}
};

export default withAuth;
