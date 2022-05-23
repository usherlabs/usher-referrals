import { CeramicClient } from "@ceramicnetwork/http-client";
import { ceramicUrl } from "@/env-config";

let client: CeramicClient | null = null;

const getInstance = (): CeramicClient => {
	if (client === null) {
		client = new CeramicClient(ceramicUrl);
		console.log(`Ceramic connected to URL: ${ceramicUrl}`); // eslint-disable-line
	}
	return client;
};

export default getInstance;
