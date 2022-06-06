import "dotenv/config";

export const didKey = process.env.DID_KEY;

export const ceramicUrl =
	process.env.NEXT_PUBLIC_CERAMIC_URL || "https://ceramic-clay.3boxlabs.com";

if (!didKey) {
	throw new Error("DID Key is required!");
}
