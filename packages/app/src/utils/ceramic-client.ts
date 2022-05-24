import { CeramicClient } from "@ceramicnetwork/http-client";
import { ceramicUrl } from "@/env-config";

export const ceramic = new CeramicClient(ceramicUrl);
