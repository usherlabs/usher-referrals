import { CeramicClient } from "@ceramicnetwork/http-client";
import { ceramicUrl } from "@/env-config";

export const ceramic = new CeramicClient(ceramicUrl);

export const ceramicUtils = {
	urlToId: (id: string) => id.replace("ceramic://", ""),
	idToUrl: (id: string) => `ceramic://${id}`
};
