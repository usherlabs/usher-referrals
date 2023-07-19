import { ETHEREUM_RPC_URL } from "@/constants";
import { ethers } from "ethers";

let ethereum: ethers.providers.BaseProvider;
export const getEthereumClient = () => {
	if (!ethereum) {
		ethereum = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL);
	}
	return ethereum;
};
