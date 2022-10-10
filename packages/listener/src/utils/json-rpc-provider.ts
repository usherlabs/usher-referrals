import { ethers } from "ethers";
import { providerUrl } from "../config";

let provider: ethers.providers.JsonRpcProvider;

export const getJsonRpcProvider = () => {
	if (!provider) {
		provider = new ethers.providers.JsonRpcProvider(providerUrl);
	}
	return provider;
};
