import { Magic } from "magic-sdk";
import { magicPublicKey } from "@/env-config";
import { magicSecretKey } from "@/server/env-config";

let client: Magic | null = null;

const getInstance = (): Magic => {
	if (client === null) {
		if (magicSecretKey) {
			client = new Magic(magicSecretKey);
		} else {
			client = new Magic(magicPublicKey || "");
		}
	}
	return client;
};

export default getInstance;
