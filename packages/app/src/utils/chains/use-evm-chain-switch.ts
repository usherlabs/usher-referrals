import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import _ from "lodash";
import { toHex } from "@/utils/chains/toHex";
import type { Chain } from "@web3-onboard/common";

const getChainLabel = (chainId: string, availableChains: Chain[]) => {
	const chain = availableChains.find((c) => c.id === chainId);
	return chain?.label ?? "Unsupported chain";
};

export const useEVMChainSwitch = (providerLabel?: string) => {
	const [{ wallet: walletState }] = useConnectWallet();
	const [{ chains: availableChains, settingChain, connectedChain }, setChain] =
		useSetChain(providerLabel);

	const options = availableChains.map((chain) => ({
		label: chain.label ?? "Unsupported chain",
		value: typeof chain.id === "string" ? chain.id : toHex(chain.id)
	}));

	const currentChains = _.compact(
		(providerLabel ? [connectedChain] : walletState?.chains) ?? []
	).map((c) => ({ ...c, label: getChainLabel(c.id, availableChains) }));

	return {
		options,
		currentChains,
		settingChain,
		availableChains,
		setChain
	};
};
