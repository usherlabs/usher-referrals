import "dotenv/config";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ModelManager } from "@glazed/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";
import { Base64 } from "js-base64";

import { didKey, ceramicUrl } from "@/env-config";
import { randomString } from "./random-string";

export const ceramicInstance = new CeramicClient(ceramicUrl);

export const getNetworkDID = async (paramKey?: string) => {
	const k = paramKey || didKey;
	if (!k) {
		throw new Error(
			"DID Key is required! Either pass via Environment DID_KEY or --key parameter"
		);
	}

	const key = fromString(k, "base16");
	// Create and authenticate the DID
	const did = new DID({
		provider: new Ed25519Provider(key),
		resolver: getResolver()
	});
	await did.authenticate();

	return did;
};

export const getCeramic = async (paramKey?: string) => {
	const did = await getNetworkDID(paramKey);

	// Connect to the local Ceramic node
	ceramicInstance.did = did;

	return ceramicInstance;
};

export const getManager = async () => {
	const ceramic = await getCeramic();

	// Create a manager for the model
	const manager = new ModelManager({ ceramic });

	return manager;
};

export const getAuthToken = async (did: DID) => {
	const nonce = randomString(32);
	const sig = await did.createJWS(nonce, { did: did.id });
	const body = [[did.id, sig]];
	const token = Base64.encode(JSON.stringify(body));
	return token;
};
