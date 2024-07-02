import { ApiConfig } from "arweave/node/lib/api";

export function parseArweaveApiConfig(urlString: string) {
	const url = new URL(urlString);

	return {
		host: url.hostname,
		protocol: url.protocol.replace(":", ""),
		port: url.port,
	} as ApiConfig;
}
