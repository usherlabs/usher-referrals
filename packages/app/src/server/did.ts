import { DID } from "dids";
import { fromString } from "uint8arrays";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";

import { didKey } from "@/server/env-config";

export const getAppDID = async () => {
	if (!didKey) {
		throw new Error(
			"DID Key is required! Either pass via Environment DID_KEY or --key parameter"
		);
	}

	const key = fromString(didKey, "base16");
	// Create and authenticate the DID
	const did = new DID({
		provider: new Ed25519Provider(key),
		resolver: getKeyResolver()
	});
	await did.authenticate();

	return did;
};
