import { Magic } from "magic-sdk";
import { magicPublicKey } from "@/env-config";

export const magic =
	typeof window !== "undefined" ? new Magic(magicPublicKey!) : null;
