import nextConnect from "next-connect";
import { Base64 } from "js-base64";
import { DagJWS, DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ceramic } from "@/utils/ceramic-client";

import { AuthApiRequest, ApiResponse } from "@/types";

const verify = async (did: string, sig: string | DagJWS) => {
	const instance = new DID({
		resolver: {
			...get3IDResolver(ceramic),
			...getKeyResolver()
		}
	});
	const result = await instance.resolve(did);
	console.log(`resolve result`, result);
	const v = instance.verifyJWS(sig);
	console.log(`verification`, v);
	return false;
};

const withAuth = nextConnect().use(
	async (req: AuthApiRequest, res: ApiResponse, next) => {
		if (!req.token) {
			return res.status(403).json({
				success: false
			});
		}
		let payload;
		try {
			payload = JSON.parse(Base64.decode(req.token));
		} catch (e) {
			return res.status(403).json({
				success: false
			});
		}

		// Payload is an array of dids and their respective signature
		const user = (
			await Promise.all(
				payload.map(
					async ([did, sig, wallet]: [
						string,
						string | DagJWS,
						[string, string, string] | undefined
					]) => {
						const verified = await verify(did, sig);
						if (!verified) {
							return null;
						}
						return {
							did,
							wallet: wallet
								? {
										chain: wallet[0],
										address: wallet[1],
										connection: wallet[2]
								  }
								: null
						};
					}
				)
			)
		).filter((did) => typeof did !== null);
		console.log(`user`, user);

		if (!user.length) {
			return res.status(403).json({
				success: false
			});
		}

		req.user = user;

		return next();
	}
);

export default withAuth;
