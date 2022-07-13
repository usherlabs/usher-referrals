import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Pane, toaster, Text, Tooltip, useTheme } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";
import { css } from "@linaria/core";
import { aql } from "arangojs";
import { useQuery } from "react-query";
import isEmpty from "lodash/isEmpty";
import ono from "@jsdevtools/ono";

import { useUser } from "@/hooks/";
import { FEE_MULTIPLIER, MAX_SCREEN_WIDTH } from "@/constants";
import ClaimButton from "@/components/Campaign/ClaimButton";
import Funding from "@/components/Campaign/Funding";
import Terms from "@/components/Campaign/Terms";
import Progress from "@/components/Progress";
import {
	Chains,
	Campaign,
	RewardTypes,
	CampaignReward,
	PartnershipMetrics,
	Wallet,
	Claim
} from "@/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useRedir from "@/hooks/use-redir";
import Serve404 from "@/components/Serve404";
import handleException from "@/utils/handle-exception";
import Banner from "@/components/Campaign/Banner";
import Info from "@/components/Campaign/Info";
import Actions from "@/components/Campaign/Actions";
import PartnershipUI from "@/components/Campaign/Partnership";
import StartPartnership from "@/components/Campaign/StartPartnership";
import ValueCard from "@/components/ValueCard";
import Anchor from "@/components/Anchor";
import VerifyPersonhoodAlert from "@/components/VerifyPersonhoodAlert";
import { useSeedData } from "@/env-config";
import * as mediaQueries from "@/utils/media-queries";
import { getArangoClient } from "@/utils/arango-client";
import * as api from "@/api";
import Authenticate from "@/modules/auth";
import { getArweaveClient } from "@/utils/arweave-client";

type CampaignPageProps = {
	id: string;
	chain: Chains;
	campaign: Campaign;
};

const arweave = getArweaveClient();

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
		user: { wallets, partnerships, verifications },
		isLoading: isUserLoading,
		actions: { addPartnership }
	} = useUser();
	const router = useRouter();
	const loginUrl = useRedir("/login");
	const isLoggedIn = wallets.length > 0;
	const isLoading = router.isFallback;
	const { colors } = useTheme();

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

	// Ensure that the user knows what they're being rewarded regardless of their internal rewards calculation.
	let claimableRewards = metrics.data ? metrics.data.rewards : 0;
	let excessRewards = "";
	let rewardsClaimed = 0;
	if (campaign) {
		if (typeof campaign.rewardsClaimed === "number") {
			rewardsClaimed = campaign.rewardsClaimed;

			if (
				typeof campaign.reward.limit === "number" &&
				!!campaign.reward.limit
			) {
				let remainingRewards = campaign.reward.limit - campaign.rewardsClaimed;
				if (remainingRewards < 0) {
					remainingRewards = 0;
				}
				if (claimableRewards > remainingRewards) {
					const excess = claimableRewards - remainingRewards;
					if (excess > 0) {
						excessRewards = excess.toFixed(2);
					}
					claimableRewards = remainingRewards;
				}
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

	const onStartPartnership = useCallback(() => {
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
		if (campaign) {
			setPartnering(true);
			const campaignRef = {
				chain,
				address: id
			};
			addPartnership(campaignRef)
				.then(() => {
					toaster.success(
						`You are now a partner! Share your link to start earning.`,
						{ id: "start-partnership" }
					);
				})
				.catch((e) => {
					handleException(e);
					errorMessage();
				})
				.finally(() => {
					setPartnering(false);
				});
		} else {
			errorMessage();
		}
	}, [loginUrl, isLoggedIn, campaign]);

	// Get the funds staked into the campaign
	const getCampaignFunds = useCallback(async () => {
		setFundsLoading(true);
		const balance = await arweave.wallets.getBalance(campaign.id);
		const arBalance = arweave.ar.winstonToAr(balance);
		const f = parseFloat(arBalance) * (1 - FEE_MULTIPLIER);
		if (f > 0) {
			setFunds(f);
		}
		setFundsLoading(false);
	}, []);

	// Reward Claim callback -- receives the selected wallet as a parameter
	const onClaim = useCallback(
		async (wallet: Wallet) => {
			setClaiming(true);
			try {
				const authInstance = Authenticate.getInstance();
				const authToken = await authInstance.getAuthToken();
				const response = await api.claim(authToken).post(
					viewingPartnerships.map((p) => p.id),
					wallet.address
				);
				if (response.success) {
					if (response.data.txId) {
						toaster.success(`Rewards claimed successfully!`, {
							id: "reward-claim",
							duration: 30,
							description: response.data.txUrl ? (
								<Anchor href={response.data.txUrl} external>
									{response.data.txUrl}
								</Anchor>
							) : null
						});
						const claim = {
							amount: response.data.amount,
							tx: { id: response.data.txId, url: response.data.txUrl || "" }
						};
						setClaims([...claims, claim]);
						setFunds(funds - response.data.amount);

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
							<Info campaign={campaign as Campaign} />
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
					{!isLoading && !isUserLoading ? (
						<>
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
							<Pane
								background="tint2"
								borderRadius={8}
								padding={12}
								marginBottom={12}
							>
								<Funding
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
										value={(rewardsClaimed || 0) / campaign.reward.limit}
										label={`${(rewardsClaimed || 0).toFixed(2)} / ${
											campaign.reward.limit
										} ${campaign.reward.ticker}${
											campaign.reward.type !== RewardTypes.TOKEN
												? ` ${campaign.reward.type.toUpperCase()}s`
												: ""
										} Claimed`}
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
					{partnership && (
						<>
							<Pane
								padding={12}
								background="tint2"
								borderRadius={8}
								marginBottom={20}
							>
								<Pane display="flex" marginBottom={24}>
									{!isLoading && campaign ? (
										<ValueCard
											isLoading={metrics.isLoading}
											ticker={campaign.reward.ticker}
											value={
												<>
													{claimableRewards}
													{!!excessRewards && (
														<Tooltip content="You have earned excess rewards!">
															<Text color={colors.blue500} marginLeft={4}>
																+{excessRewards}
															</Text>
														</Tooltip>
													)}
												</>
											}
											id="claimable-rewards"
											label="Claimable Rewards"
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
											reward={campaign.reward as CampaignReward}
											active={
												!!verifications.personhood && !!verifications.captcha
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
							<Pane marginBottom={12}>
								{!isUserLoading ? (
									<>{!verifications.personhood && <VerifyPersonhoodAlert />}</>
								) : (
									<Skeleton
										style={{
											borderRadius: 8,
											height: 100
										}}
									/>
								)}
							</Pane>
						</>
					)}
					<Pane marginBottom={12}>
						{!isLoading && campaign ? (
							<Terms campaign={campaign as Campaign} />
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
		LET rewards_claimed = (
			FOR cl IN 1..2 ANY c Engagements
				FILTER STARTS_WITH(cl._id, "Claims")
				COLLECT AGGREGATE amount = SUM(cl.amount)
				RETURN amount
		)
		LET campaign = KEEP(c, ATTRIBUTES(c, true))
		RETURN MERGE(
				campaign,
				{
						rewards_claimed: TO_NUMBER(rewards_claimed[0])
				}
		)
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
		}
	};
};

export default CampaignPage;
