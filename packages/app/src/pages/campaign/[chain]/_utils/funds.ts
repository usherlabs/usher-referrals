import { atom, useAtomValue, useSetAtom } from "jotai";
import { campaignFundsAtoms } from "@/components/Campaign/Funds";
import * as api from "@/api";
import { isEthereumBasedNetwork } from "@/utils/isEthereumBasedNetwork";
import { erc20 } from "@/abi/erc20";
import { FEE_MULTIPLIER } from "@/constants";
import { Chains } from "@usher.so/shared";
import { Campaign, RewardTypes } from "@usher.so/campaigns";
import { ethers } from "ethers";
import React from "react";
import { providersAtoms } from "@/utils/user-state-management/atoms/providers";
import { getEVMBasedProvider } from "@/utils/chains/getEVMBasedProvider";

export const fundsAtom = atom<number>(0);

export function useGetCampaignFunds({
	campaign
}: {
	campaign?: Campaign | null;
}) {
	const warp = useAtomValue(providersAtoms.warp);

	const setFundsLoading = useSetAtom(campaignFundsAtoms.loading);
	const setFunds = useSetAtom(fundsAtom);

	return React.useCallback(async () => {
		if (!campaign) {
			return;
		}
		setFundsLoading(true);
		if (campaign.chain === Chains.ARWEAVE) {
			if (campaign.reward.address) {
				const contract = warp.contract(campaign.reward.address);
				const contractState = await contract.readState();
				if (campaign.reward.type === RewardTypes.PST) {
					const state = contractState.state as {
						balances: Record<string, number>;
					};
					const balance = state.balances[campaign.id] || 0;
					// No fee multiplier for custom PSTs for now
					if (balance > 0) {
						setFunds(balance);
					}
				}
			} else {
				try {
					const { balance } = await api
						.balance()
						.get(campaign.id, campaign.chain);
					if (balance > 0) {
						setFunds(balance);
					}
				} catch (e) {
					console.log("Failed to load Arweave Balance");
					console.error(e);
				}
			}
		} else if (isEthereumBasedNetwork(campaign.chain)) {
			const evmProvider = getEVMBasedProvider(campaign.chain);
			if (campaign.reward.address) {
				if (campaign.reward.type === RewardTypes.ERC20) {
					const contract = new ethers.Contract(
						campaign.reward.address,
						erc20,
						evmProvider
					);
					const decimals = await contract.decimals();
					const balanceBN = await contract.balanceOf(campaign.id);
					const balanceStr = ethers.utils.formatUnits(balanceBN, decimals);
					const f = parseFloat(balanceStr);
					if (f > 0) {
						setFunds(f);
					}
				}
			} else {
				const balanceBN = await evmProvider.getBalance(campaign.id);
				const balanceStr = ethers.utils.formatEther(balanceBN);
				const balance = parseFloat(balanceStr);
				const f = balance * (1 - FEE_MULTIPLIER);
				if (f > 0) {
					setFunds(f);
				}
			}
		}
		setFundsLoading(false);
	}, [campaign, setFunds, setFundsLoading, warp]);
}

export function useRecalculateFundsForCampaign(campaign?: Campaign | null) {
	const getCampaignFunds = useGetCampaignFunds({ campaign });
	React.useEffect(() => {
		if (!campaign) {
			return () => {};
		}
		getCampaignFunds();

		return () => {};
	}, [campaign, getCampaignFunds]);
}
