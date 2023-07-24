import { EthereumBasedNetwork } from "@/utils/isEthereumBasedNetwork";
import { ETHEREUM_CHAINS } from "@/constants";
import { ethereumChainByChainId } from "@/utils/get-chain-by-id";
import { ethers } from "ethers";

export const getEVMBasedRPCUrl = (chain: EthereumBasedNetwork) => {
	return ETHEREUM_CHAINS.find(
		(chainObj) => chain === ethereumChainByChainId[chainObj.id]
	)?.rpcUrl;
};

export const getEVMBasedProvider = (chain: EthereumBasedNetwork) => {
	const rpcUrl = getEVMBasedRPCUrl(chain);
	if (!rpcUrl) {
		throw new Error("Invalid chain");
	}
	return new ethers.providers.JsonRpcProvider(rpcUrl);
};
