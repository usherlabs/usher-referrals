import Arweave from "arweave";
import { arweaveLocalPort } from "@/env-config";

let arweave: Arweave;
export const getArweaveClient = (useLocal = false) => {
	if (!arweave) {
		arweave = Arweave.init(
			useLocal || arweaveLocalPort
				? {
						host: "127.0.0.1",
						port: arweaveLocalPort || 1984,
						protocol: "http"
				  }
				: {
						host: "arweave.net",
						port: 443,
						protocol: "https"
				  }
		);
	}
	return arweave;
};
