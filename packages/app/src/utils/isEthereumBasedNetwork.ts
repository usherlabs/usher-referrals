import { Chains, EVMBasedChainList } from "@usher.so/shared";

const ethereumBasedNetworks = EVMBasedChainList;

export type EthereumBasedNetwork = typeof ethereumBasedNetworks[number];
// made this way so it can correctly work as a type guard
export const isEthereumBasedNetwork = <Chain extends Chains[number]>(
	chain: Chain
): chain is Extract<Chain, EthereumBasedNetwork> => {
	return ethereumBasedNetworks.includes(chain as any);
};
