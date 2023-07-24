import { BSC_CHAIN_ID, ETHEREUM_CHAIN_ID, POLYGON_CHAIN_ID } from "@/constants";
import { Chains } from "@usher.so/shared";

export const UNSUPPORTED_EVM_CHAIN = "unsupported_evm_chain" as const;

export const ethereumChainIdsByChain = {
	[Chains.ETHEREUM]: ETHEREUM_CHAIN_ID,
	[Chains.BSC]: BSC_CHAIN_ID,
	[Chains.POLYGON]: POLYGON_CHAIN_ID
};

export const ethereumChainByChainId = {
	[ETHEREUM_CHAIN_ID]: Chains.ETHEREUM,
	[BSC_CHAIN_ID]: Chains.BSC,
	[POLYGON_CHAIN_ID]: Chains.POLYGON
};
/**
 * @param id - Expected to be in hex format
 */
export const getChainById = (
	id: string
): Chains | typeof UNSUPPORTED_EVM_CHAIN => {
	if (!id.startsWith("0x")) {
		throw new Error(`Expected id to be in hex format. Received: ${id}`);
	}
	return ethereumChainByChainId[id] ?? UNSUPPORTED_EVM_CHAIN;
};

export const isSupportedChain = <T extends any>(
	c: T
): c is Exclude<T, typeof UNSUPPORTED_EVM_CHAIN> => c !== UNSUPPORTED_EVM_CHAIN;
