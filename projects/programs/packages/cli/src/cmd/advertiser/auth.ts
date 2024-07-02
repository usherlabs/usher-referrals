import { Command } from "commander";
import { randomBytes } from "crypto";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { toString } from "uint8arrays";

export const authCommand = new Command()
	.name("auth")
	.description("Authenticate with a new DID")
	.action(async () => {
		const seed = new Uint8Array(randomBytes(32));
		const did = new DID({
			provider: new Ed25519Provider(seed),
			resolver: getResolver(),
		});
		await did.authenticate();
		console.log(`Created DID ${did.id} with seed ${toString(seed, "base16")}`);
	});
