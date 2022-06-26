import nextConnect from "next-connect";
import { Base64 } from "js-base64";
import { DagJWS, DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import isEmpty from "lodash/isEmpty";
import util from "util";

import { AuthApiRequest, ApiResponse } from "@/types";

const verify = async (did: string, sig: DagJWS): Promise<boolean> => {
	const instance = new DID({
		resolver: {
			...getKeyResolver()
		}
	});
	const result = await instance.verifyJWS(sig, { issuer: did });
	console.log(`verification`, util.inspect(result, false, null, true));
	if (result.kid) {
		return true;
	}

	return false;
};

const withAuth = nextConnect().use(
	async (req: AuthApiRequest, res: ApiResponse, next) => {
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

			return next();
		} catch (e) {
			req.log.error(e);
			return res.status(403).json({
				success: false
			});
		}
	}
);

export default withAuth;
