import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { claimAtoms } from "@/components/Campaign/ClaimButton";
import { useUser } from "@/hooks";
import * as api from "@/api";
import Anchor from "@/components/Anchor";
import { AppEvents, events } from "@/utils/events";
import handleException from "@/utils/handle-exception";
import { Campaign } from "@usher.so/campaigns";
import { Wallet } from "@usher.so/shared";
import React from "react";
import { toaster } from "evergreen-ui";
import ono from "@jsdevtools/ono";
import {
	fundsAtom,
	useGetCampaignFunds
} from "@/pages/campaign/[chain]/_utils/funds";
import {
	useCampaignPartnershipsMetrics,
	usePartnershipsForCampaign
} from "@/pages/campaign/[chain]/_utils/partnership-hooks";

export function useHandleClaim({
	id,
	chain,
	campaign
}: {
	id: string;
	chain: string;
	campaign?: Campaign | null;
}) {
	const [, setIsClaiming] = useAtom(claimAtoms.isClaiming);
	const { auth } = useUser();
	const viewingPartnerships = usePartnershipsForCampaign({ id, chain });
	const funds = useAtomValue(fundsAtom);
	const setClaims = useSetAtom(claimAtoms.claims);
	const getCampaignFunds = useGetCampaignFunds({ campaign });

	return React.useCallback(
		async (wallet: Wallet) => {
			setIsClaiming(true);
			try {
				const authToken = await auth.getAuthToken();
				const response = await api.claim(authToken).post(
					viewingPartnerships.map((p) => p.id),
					wallet.address
				);
				if (response.success && response.data) {
					const claim = response.data;
					if (claim.tx) {
						toaster.success(`Rewards claimed successfully!`, {
							id: "reward-claim",
							duration: 30,
							description: claim.tx?.url ? (
								<Anchor href={claim.tx.url} external>
									{claim.tx.url}
								</Anchor>
							) : null
						});
						const newFunds = funds - claim.amount;
						setClaims((claims) => [...claims, claim]);
						getCampaignFunds();

						events.emit(AppEvents.REWARDS_CLAIM, {
							claim,
							newFunds
						});

						return claim;
					}
					toaster.notify(`No reward amount left to be paid!`, {
						id: "reward-claim",
						duration: 30
					});
				} else {
					throw ono("Failed to process claim", response);
				}
			} catch (e) {
				toaster.danger(
					`Rewards claim failed to be processed. Please refresh and try again.`,
					{ id: "reward-claim", duration: 30 }
				);
				handleException(e);
			} finally {
				setIsClaiming(false);
			}
			return null;
		},
		[
			setIsClaiming,
			auth,
			viewingPartnerships,
			funds,
			setClaims,
			getCampaignFunds
		]
	);
}

/**
 *
 * @param campaign
 * @param chain
 * @param id
 */
export function useRewards({
	campaign,
	chain,
	id
}: {
	campaign?: Campaign | null;
	chain: string;
	id: string;
}) {
	const metrics = useCampaignPartnershipsMetrics({ chain, id });

	return React.useMemo(() => {
		let claimableRewards = metrics.data ? metrics.data.rewards : 0;
		let excessRewards = 0;
		const rewardsClaimed = metrics.data ? metrics.data.campaign.claimed : 0;
		if (campaign) {
			if (
				typeof campaign.reward.limit === "number" &&
				!!campaign.reward.limit
			) {
				let remainingRewards = campaign.reward.limit - rewardsClaimed;
				if (remainingRewards < 0) {
					remainingRewards = 0;
				}
				if (claimableRewards > remainingRewards) {
					excessRewards = parseFloat(
						(claimableRewards - remainingRewards).toFixed(2)
					);
					if (excessRewards <= 0) {
						excessRewards = 0;
					}
					claimableRewards = remainingRewards;
				}
			}
		}
		return { claimableRewards, excessRewards, rewardsClaimed };
	}, [campaign, metrics.data]);
}
