import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Pane, toaster } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";
import { css } from "@linaria/core";
import { aql } from "arangojs";
import { useQuery } from "react-query";
import isEmpty from "lodash/isEmpty";

import { useUser } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import ClaimButton from "@/components/Campaign/ClaimButton";
import Terms from "@/components/Campaign/Terms";
import Progress from "@/components/Progress";
import {
	Chains,
	Campaign,
	RewardTypes,
	CampaignReward,
	PartnershipMetrics
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
import VerifyPersonhoodAlert from "@/components/VerifyPersonhoodAlert";
import { useSeedData } from "@/env-config";
import * as mediaQueries from "@/utils/media-queries";
import { getArangoClient } from "@/utils/arango-client";
import * as api from "@/api";

type CampaignPageProps = {
	id: string;
	chain: Chains;
	campaign: Campaign;
};

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

	const [isPartnering, setPartnering] = useState(false);

	const walletsForChain = wallets.filter((w) => w.chain === chain);
	const viewingPartnerships = partnerships.filter(
		(p) => p.campaign.address === id && p.campaign.chain === chain
	);
	const partnership =
		viewingPartnerships.length > 0 ? viewingPartnerships[0] : null; // get the first partnership for link usage.

	const metrics = useQuery(["partnership-metrics", viewingPartnerships], () =>
		getPartnershipMetrics(viewingPartnerships.map((p) => p.id))
	);

	// Ensure that the user knows what they're being rewarded regardless of their internal rewards calculation.
	let claimableRewards = metrics.data ? metrics.data.rewards : 0;
	if (campaign) {
		if (
			typeof campaign.rewardsClaimed === "number" &&
			typeof campaign.reward.limit === "number" &&
			!!campaign.reward.limit
		) {
			const remainingRewards = campaign.reward.limit - campaign.rewardsClaimed;
			if (claimableRewards > remainingRewards) {
				claimableRewards = remainingRewards;
			}
		}
	}

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

	const onClaim = useCallback(async () => {
		console.log("Hello world!");
	}, []);

	// useEffect(() => {
	// 	if (user !== null) {
	// 		const eventPayload = {
	// 			id: advertiser.usherContractAddress,
	// 			nativeId: user.id,
	// 			properties: {
	// 				walletAddress: wallet.address
	// 			}
	// 		};
	// 		Usher("event", eventPayload);
	// 	}
	// }, []);

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
							{campaign.reward.limit && campaign.reward.limit > 0 ? (
								<Pane
									background="tint2"
									borderRadius={8}
									padding={12}
									marginBottom={12}
								>
									<Progress
										value={
											(campaign.rewardsClaimed || 0) / campaign.reward.limit
										}
										label={`${campaign.rewardsClaimed || 0} / ${
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
											value={claimableRewards}
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
											wallets={walletsForChain}
											amount={claimableRewards}
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
			FOR cl IN 1..1 INBOUND c Verifications
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
