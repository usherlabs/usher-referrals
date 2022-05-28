import { writeFile } from "node:fs/promises";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ModelManager } from "@glazed/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

import { didKey, ceramicUrl } from "@/env-config";

export const ceramic = new CeramicClient(ceramicUrl);

const getManager = async () => {
	// The key must be provided as an environment variable
	const key = fromString(didKey!, "base16");
	// Create and authenticate the DID
	const did = new DID({
		provider: new Ed25519Provider(key),
		resolver: getResolver()
	});
	await did.authenticate();

	// Connect to the local Ceramic node
	ceramic.did = did;

	// Create a manager for the model
	// @ts-ignore
	const manager = new ModelManager({ ceramic });

	return manager;
};

export default getManager;
