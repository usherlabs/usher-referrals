import { ethereumChainIdsByChain } from "@/utils/get-chain-by-id";
import React from "react";
import { useSetChain } from "@web3-onboard/react";
import { Chains } from "@usher.so/shared";
import { toaster } from "evergreen-ui";

export function useSetToCampaignChain({
	campaignChain
}: {
	campaignChain: Chains;
}) {
	const [{ settingChain }, setChain] = useSetChain();

	// handle alert manually
	// we won't handle here arweave and other wallets not handled by useSetChain
	const alertConnectManually = React.useCallback(() => {
		toaster.warning(
			`Please connect to chain ${campaignChain} and sign to continue.`
		);
	}, [campaignChain]);

	// handle connection click
	const setToCampaignChain = React.useCallback(() => {
		if (campaignChain in ethereumChainIdsByChain) {
			setChain({ chainId: ethereumChainIdsByChain[campaignChain] });
		} else {
			alertConnectManually();
		}
	}, [campaignChain, setChain, alertConnectManually]);

	return {
		settingChain,
		setToCampaignChain
	};
}
