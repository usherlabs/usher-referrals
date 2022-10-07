import { ethereumProviderUrl } from "@/server/env-config";
import { ethers } from "ethers";

let ethereum: ethers.providers.BaseProvider;

export const getEthereumClient = (useLocal = false) => {
	if (!ethereum) {
		ethereum = new ethers.providers.JsonRpcProvider(ethereumProviderUrl)
	}
	return ethereum;
};
