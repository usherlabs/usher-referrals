import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Pane, toaster } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";
import { css } from "@linaria/core";
import { aql } from "arangojs";
import { useQuery } from "react-query";
import isEmpty from "lodash/isEmpty";
import ono from "@jsdevtools/ono";

import { useUser } from "@/hooks/";
import { FEE_MULTIPLIER, MAX_SCREEN_WIDTH } from "@/constants";
import ClaimButton from "@/components/Campaign/ClaimButton";
import Funds from "@/components/Campaign/Funds";
import Rewards from "@/components/Campaign/Rewards";
import InfoAccordions from "@/components/Campaign/InfoAccordions";
import WhitelistAlert from "@/components/Campaign/WhitelistAlert";
import Progress from "@/components/Progress";
import { Chains, Wallet } from "@usher.so/shared";
import { Campaign, RewardTypes, CampaignReward } from "@usher.so/campaigns";
import { PartnershipMetrics, Claim } from "@/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useRedir from "@/hooks/use-redir";
import Serve404 from "@/components/Serve404";
import handleException from "@/utils/handle-exception";
import Banner from "@/components/Campaign/Banner";
import Title from "@/components/Campaign/Title";
import Actions from "@/components/Campaign/Actions";
import PartnershipUI from "@/components/Campaign/Partnership";
import StartPartnership from "@/components/Campaign/StartPartnership";
import Anchor from "@/components/Anchor";
import VerifyPersonhoodAlert from "@/components/VerifyPersonhood/Alert";
import { useSeedData } from "@/env-config";
import * as mediaQueries from "@/utils/media-queries";
import { getArangoClient } from "@/utils/arango-client";
import * as api from "@/api";
import { getWarp } from "@/utils/arweave-client";
import { AppEvents, events } from "@/utils/events";
import { getEthereumClient } from "@/utils/ethereum-client";
import { ethers } from "ethers";
import { erc20 } from "@/abi/erc20";

type CampaignPageProps = {
	id: string;
	chain: Chains;
	campaign: Campaign;
};

const warp = getWarp();

const ethereum = getEthereumClient();

const getPartnershipMetrics = async (
	ids: string[]
): Promise<PartnershipMetrics | null> => {
	if (ids.length === 0) {
		return null;
	}

	const response = await api.partnerships().get(ids);

	if (!response.success) {
		return null;
	}

	return response.data as PartnershipMetrics;
};

const CampaignPage: React.FC<CampaignPageProps> = ({ id, chain, campaign }) => {
	const {
		auth,
		user: { wallets, partnerships, verifications },
		isLoading: isUserLoading,
		actions: { addPartnership }
	} = useUser();
	const router = useRouter();
	const loginUrl = useRedir("/login");
	const isLoggedIn = wallets.length > 0;
	const isLoading = router.isFallback;

	const [isPartnering, setPartnering] = useState(false);
	const [isClaiming, setClaiming] = useState(false);
	const [claims, setClaims] = useState<Claim[]>([]);
	const [isFundsLoading, setFundsLoading] = useState(true);
	const [funds, setFunds] = useState(0);

	const walletsForChain = wallets.filter((w) => w.chain === chain);
	const viewingPartnerships = partnerships.filter(
		(p) => p.campaign.address === id && p.campaign.chain === chain
	);
	const partnership =
		viewingPartnerships.length > 0 ? viewingPartnerships[0] : null; // get the first partnership for link usage.

	const metrics = useQuery(
		["partnership-metrics", viewingPartnerships, claims],
		() => getPartnershipMetrics(viewingPartnerships.map((p) => p.id))
	);

	const canClaimThisMonth = useMemo(() => {
		if (chain !== Chains.ETHEREUM || !metrics.data) {
			return true;
		}

		const lastClaimedDate = new Date(metrics.data.lastClaimedAt);
		const now = new Date(Date.now());
		return (
			lastClaimedDate.getUTCFullYear() !== now.getUTCFullYear() ||
			lastClaimedDate.getUTCMonth() !== now.getUTCMonth()
		);
	}, [metrics]);

	// Ensure that the user knows what they're being rewarded regardless of their internal rewards calculation.
	let claimableRewards = metrics.data ? metrics.data.rewards : 0;
	let excessRewards = 0;
	const rewardsClaimed = metrics.data ? metrics.data.campaign.claimed : 0;
	if (campaign) {
		if (typeof campaign.reward.limit === "number" && !!campaign.reward.limit) {
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
	// No need for the below as the campaign with re-request on new claim
	// claims.forEach((claim) => {
	// 	claimableRewards -= claim.amount;
	// 	if (claimableRewards < 0) {
	// 		claimableRewards = 0;
	// 	}
	// 	rewardsClaimed += claim.amount;
	// });

	const onStartPartnership = useCallback(async () => {
		if (!isLoggedIn) {
			router.push(loginUrl);
			return;
		}
		const errorMessage = () =>
			toaster.danger(
				"Oops! Something has gone wrong partnering with this campaign.",
				{
					id: "start-partnership"
				}
			);
		if (!campaign) {
			errorMessage();
			return;
		}
		setPartnering(true);
		const campaignRef = {
			chain,
			address: id
		};
		try {
			await addPartnership(campaignRef);
			toaster.success(`🎉  You have engaged this partnership!`, {
				id: "start-partnership",
				description: `Complete any remaining verifications and reviews to start earning rewards when you share your invite link!.`
			});
		} catch (e) {
			handleException(e);
			errorMessage();
		} finally {
			setPartnering(false);
		}
	}, [loginUrl, isLoggedIn, campaign, addPartnership]);

	// Get the funds staked into the campaign
	const getCampaignFunds = useCallback(async () => {
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
		} else if (campaign.chain === Chains.ETHEREUM) {
			if (campaign.reward.address) {
				if (campaign.reward.type === RewardTypes.ERC20) {
					const contract = new ethers.Contract(
						campaign.reward.address,
						erc20,
						ethereum
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
				const balanceBN = await ethereum.getBalance(campaign.id);
				const balanceStr = ethers.utils.formatEther(balanceBN);
				const balance = parseFloat(balanceStr);
				const f = balance * (1 - FEE_MULTIPLIER);
				if (f > 0) {
					setFunds(f);
				}
			}
		}
		setFundsLoading(false);
	}, []);

	// Reward Claim callback -- receives the selected wallet as a parameter
	const onClaim = useCallback(
		async (wallet: Wallet) => {
			setClaiming(true);
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
						setClaims([...claims, claim]);
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
				setClaiming(false);
			}
			return null;
		},
		[viewingPartnerships, funds, claims]
	);

	useEffect(() => {
		if (!campaign) {
			return () => {};
		}

		getCampaignFunds();

		return () => {};
	}, [campaign]);

	if (!campaign) {
		return <Serve404 />;
	}

	return (
		<Pane
			display="flex"
			alignItems="center"
			flexDirection="column"
			maxWidth={MAX_SCREEN_WIDTH - 32}
			marginX="auto"
			width="100%"
		>
			{!isLoading &&
			campaign &&
			(campaign.details.image || campaign.advertiser.icon) ? (
				<Banner campaign={campaign} />
			) : (
				<Pane paddingY={16} />
			)}
			<Pane paddingTop={24} paddingBottom={0} paddingX={16} width="100%">
				{!isLoading && campaign ? (
					<Pane
						display="flex"
						flexDirection="row"
						alignItems="flex-start"
						justifyContent="space-between"
						width="100%"
						className={css`
							${mediaQueries.isLarge} {
								flex-direction: column !important;
							}
						`}
					>
						<Pane
							flex={1}
							className={css`
								${mediaQueries.isLarge} {
									width: 100%;
									text-align: center;
								}
							`}
						>
							<Title campaign={campaign as Campaign} />
						</Pane>
						<Pane
							width="40%"
							className={css`
								${mediaQueries.isLarge} {
									width: 100% !important;
								}
							`}
						>
							<Pane
								display="flex"
								flexDirection="row"
								alignItems="center"
								justifyContent="flex-end"
								flexWrap="wrap"
								className={css`
									${mediaQueries.isLarge} {
										justify-content: center !important;
										margin-top: 24px !important;
										margin-bottom: 24px !important;
									}
								`}
							>
								<Actions campaign={campaign as Campaign} />
							</Pane>
						</Pane>
					</Pane>
				) : (
					<Skeleton
						count={5}
						style={{
							maxWidth: 500
						}}
					/>
				)}
			</Pane>
			<Pane
				display="flex"
				flexDirection="row"
				width="100%"
				padding={16}
				className={css`
					${mediaQueries.isLarge} {
						flex-direction: column !important;
					}
				`}
			>
				<Pane flex={1} margin={6}>
					{campaign.disableVerification !== true && (
						<>
							{!isUserLoading ? (
								<>
									{!verifications.personhood && (
										<Pane marginBottom={12}>
											<VerifyPersonhoodAlert />
										</Pane>
									)}
								</>
							) : (
								<Pane marginBottom={12}>
									<Skeleton
										style={{
											borderRadius: 8,
											height: 100
										}}
									/>
								</Pane>
							)}
						</>
					)}
					{!isLoading && !isUserLoading ? (
						<>
							{typeof campaign.whitelist !== "undefined" && (
								<Pane marginBottom={12}>
									<WhitelistAlert
										partnership={partnership}
										whitelist={campaign.whitelist}
									/>
								</Pane>
							)}
							{partnership ? (
								<PartnershipUI
									partnership={partnership}
									metrics={{
										isLoading: metrics.isLoading,
										data: metrics.data || null
									}}
								/>
							) : (
								<StartPartnership
									onStart={onStartPartnership}
									chain={chain}
									isLoading={isPartnering}
									hasWallets={walletsForChain.length > 0}
								/>
							)}
						</>
					) : (
						<Skeleton
							style={{
								height: 300,
								borderRadius: 8
							}}
						/>
					)}
				</Pane>
				<Pane
					width="40%"
					margin={6}
					className={css`
						${mediaQueries.isLarge} {
							width: 100% !important;
						}
					`}
				>
					{!isLoading && campaign ? (
						<>
							{campaign.reward.limit && campaign.reward.limit > 0 ? (
								<Pane
									background="tint2"
									borderRadius={8}
									padding={12}
									marginBottom={12}
								>
									<Progress
										value={rewardsClaimed / campaign.reward.limit}
										label={`${rewardsClaimed.toFixed(2)} / ${
											campaign.reward.limit
										} ${campaign.reward.ticker} Claimed`}
										showPercentage
									/>
								</Pane>
							) : null}
						</>
					) : (
						<Skeleton
							style={{
								height: 100,
								borderRadius: 8,
								marginBottom: 12
							}}
						/>
					)}
					{!isLoading && campaign ? (
						<>
							<Pane marginBottom={12}>
								<Funds
									balance={funds}
									loading={isFundsLoading}
									ticker={campaign.reward.ticker}
								/>
							</Pane>
						</>
					) : (
						<Skeleton
							style={{
								height: 100,
								borderRadius: 8,
								marginBottom: 12
							}}
						/>
					)}
					{partnership && (
						<>
							<Pane marginBottom={20}>
								<Pane display="flex" marginBottom={-6}>
									{!isLoading && campaign ? (
										<Rewards
											loading={metrics.isLoading}
											ticker={campaign.reward.ticker}
											value={claimableRewards}
											excess={excessRewards}
										/>
									) : (
										<Skeleton
											style={{
												borderRadius: 8,
												height: 150
											}}
										/>
									)}
								</Pane>
								<Pane display="flex">
									{!isLoading && campaign ? (
										<ClaimButton
											onClaim={onClaim}
											isClaiming={isClaiming}
											isComplete={
												typeof campaign.reward.limit === "number" &&
												campaign.reward.limit > 0
													? rewardsClaimed >= campaign.reward.limit
													: false
											}
											wallets={walletsForChain}
											amount={
												claimableRewards > funds ? funds : claimableRewards
											}
											canClaimThisMonth={canClaimThisMonth}
											reward={campaign.reward as CampaignReward}
											active={
												!!verifications.captcha &&
												(campaign.disableVerification !== true
													? !!verifications.personhood
													: true)
											}
										/>
									) : (
										<Skeleton
											style={{
												borderRadius: 8,
												height: 50
											}}
										/>
									)}
								</Pane>
							</Pane>
						</>
					)}
					<Pane marginBottom={12}>
						{!isLoading && campaign ? (
							<InfoAccordions campaign={campaign as Campaign} />
						) : (
							<Skeleton
								style={{
									borderRadius: 8,
									height: 100
								}}
							/>
						)}
					</Pane>
				</Pane>
			</Pane>
		</Pane>
	);
};

// Executes at build time
export async function getStaticPaths() {
	if (useSeedData) {
		const campaignsData = (await import("@/seed/campaigns.json")).default;
		const campaigns = camelcaseKeys(campaignsData, { deep: true });

		return {
			paths: campaigns.map((c) => ({
				params: {
					id: c.id,
					chain: c.chain
				}
			})),
			fallback: false
		};
	}

	const arango = getArangoClient();
	const cursor = await arango.query(aql`
		FOR c IN Campaigns
			RETURN {
				"id": c.id,
				"chain": c.chain
			}
	`);

	const campaigns = await cursor.all();

	return {
		paths: campaigns.map((c) => ({
			params: {
				id: c.id as string,
				chain: c.chain as string
			}
		})),
		fallback: true
	};
}

export const getStaticProps = async ({
	params
}: {
	params: { id: string; chain: string };
}) => {
	if (useSeedData) {
		const campaignsData = (await import("@/seed/campaigns.json")).default;
		const campaigns = camelcaseKeys(campaignsData, { deep: true });

		return {
			props: {
				campaign: campaigns[0] as Campaign
			}
		};
	}

	const { id, chain } = params;

	const arango = getArangoClient();
	const docId = [chain, id].join(":");
	const cursor = await arango.query(aql`
		LET c = DOCUMENT("Campaigns", ${docId})
		LET campaign = KEEP(c, ATTRIBUTES(c, true))
		RETURN campaign
	`);

	const results = (await cursor.all()).filter((result) => !isEmpty(result));

	if (results.length > 0) {
		const campaign = camelcaseKeys(results[0], { deep: true });

		return {
			props: {
				id,
				chain,
				campaign,
				seo: {
					title: campaign.details.name,
					description:
						campaign.details.description ||
						`Learn and earn by partnering up with ${
							campaign.advertiser.name || campaign.details.name
						}`
				}
			}
		};
	}

	return {
		props: {
			id,
			chain,
			campaign: null
		},
		revalidate: 60
	};
};

export default CampaignPage;
