import { Magic } from "magic-sdk";
import { magicPublicKey } from "@/env-config";

export const magic =
	magicPublicKey && typeof window !== undefined
		? new Magic(magicPublicKey)
		: null;
