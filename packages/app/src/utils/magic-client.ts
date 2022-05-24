import { Magic } from "magic-sdk";
import { magicPublicKey } from "@/env-config";
import { magicSecretKey } from "@/server/env-config";

let client: Magic | null = null;

const options = {
	testMode: true // isProd
};
if (magicSecretKey) {
	client = new Magic(magicSecretKey, options);
} else {
	client = new Magic(magicPublicKey || "", options);
}

export const magic = client;
