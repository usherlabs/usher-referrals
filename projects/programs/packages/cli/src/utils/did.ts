import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

export const parseDID = (key: string) => {
	try {
		const did = new DID({
			provider: new Ed25519Provider(fromString(key, "base16")),
			resolver: getResolver(),
		});
		return did;
	} catch {
		throw new Error("Cannot read DID key");
	}
};
