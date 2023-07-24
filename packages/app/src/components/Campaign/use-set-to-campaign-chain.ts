import { ethereumChainIdsByChain } from "@/utils/get-chain-by-id";
import React from "react";
import { useSetChain } from "@web3-onboard/react";
import { toaster } from "evergreen-ui";

export function useSetToCampaignChain({
	campaignChain
}: {
	campaignChain: string;
}) {
	const [{ settingChain }, setChain] = useSetChain();

	// handle alert manually
	// we won't handle here arweave and other wallets not handled by useSetChain
	const alertConnectManually = React.useCallback(() => {
		toaster.warning(
			`Please connect to chain ${campaignChain} and sign to continue. If this persists, please contact us.`
		);
	}, [campaignChain]);

	// handle connection click
	const setToCampaignChain = React.useCallback(() => {
		if (campaignChain in ethereumChainIdsByChain) {
			// safe to cast here because we know that campaignChain is in ethereumChainIdsByChain
			setChain({
				chainId:
					ethereumChainIdsByChain[
						campaignChain as keyof typeof ethereumChainIdsByChain
					]
			});
		} else {
			alertConnectManually();
		}
	}, [campaignChain, setChain, alertConnectManually]);

	return {
		settingChain,
		setToCampaignChain
	};
}
