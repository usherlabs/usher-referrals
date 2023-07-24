import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { Button, majorScale, Pane } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";
import { css } from "@linaria/core";
import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";

import { useUser } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import ClaimButton from "@/components/Campaign/ClaimButton";
import Funds from "@/components/Campaign/Funds";
import Rewards from "@/components/Campaign/Rewards";
import InfoAccordions from "@/components/Campaign/InfoAccordions";
import WhitelistAlert from "@/components/Campaign/WhitelistAlert";
import Progress from "@/components/Progress";
import { Chains } from "@usher.so/shared";
import { Campaign, CampaignReward } from "@usher.so/campaigns";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Serve404 from "@/components/Serve404";
import Banner from "@/components/Campaign/Banner";
import Title from "@/components/Campaign/Title";
import Actions from "@/components/Campaign/Actions";
import PartnershipUI from "@/components/Campaign/Partnership";
import StartPartnership from "@/components/Campaign/StartPartnership";
import VerifyPersonhoodAlert from "@/components/VerifyPersonhood/Alert";
import { useSeedData } from "@/env-config";
import * as mediaQueries from "@/utils/media-queries";
import { getArangoClient } from "@/utils/arango-client";
import { useAtomValue } from "jotai";
import {
	useHandleClaim,
	useRewards
} from "@/pages/campaign/[chain]/_utils/claims-and-rewards";
import {
	useCampaignPartnershipsMetrics,
	usePartnershipsForCampaign
} from "@/pages/campaign/[chain]/_utils/partnership-hooks";

import {
	fundsAtom,
	useRecalculateFundsForCampaign
} from "@/pages/campaign/[chain]/_utils/funds";
import { useSetToCampaignChain } from "@/components/Campaign/use-set-to-campaign-chain";
import { GetStaticPaths, GetStaticProps } from "next";

type CampaignPageProps = {
	id: string;
	chain: Chains | string;
	campaign?: Campaign | null;
};

const CampaignPage: React.FC<CampaignPageProps> = ({ id, chain, campaign }) => {
	const {
		user: { verifications, wallets },
		isLoading: isUserLoading
	} = useUser();
	const router = useRouter();
	const isLoading = router.isFallback;

	const funds = useAtomValue(fundsAtom);

	const metrics = useCampaignPartnershipsMetrics({ chain, id });

	const walletsForChain = wallets.filter((w) => w.chain === chain);
	const viewingPartnerships = usePartnershipsForCampaign({
		id,
		chain
	});
	const fistParnershipFoundForThisCampaign = viewingPartnerships[0] ?? null;
	const isConnectedToSameChain = chain === wallets[0]?.chain;

	const canClaimThisMonth = useMemo(() => {
		// Ethereum campaigns can claim only once per month
		// if it isn't ethereum campaign or there's actually no data, we can claim this month already
		if (chain !== Chains.ETHEREUM || !metrics.data) {
			return true;
		}

		const lastClaimedDate = new Date(metrics.data.lastClaimedAt);
		const now = new Date(Date.now());
		return (
			lastClaimedDate.getUTCFullYear() !== now.getUTCFullYear() ||
			lastClaimedDate.getUTCMonth() !== now.getUTCMonth()
		);
	}, [chain, metrics.data]);

	// Ensure that the user knows what they're being rewarded regardless of their internal rewards calculation.
	const { claimableRewards, excessRewards, rewardsClaimed } = useRewards({
		campaign,
		chain,
		id
	});

	const { settingChain, setToCampaignChain } = useSetToCampaignChain({
		campaignChain: chain
	});

	// No need for the below as the campaign with re-request on new claim
	// claims.forEach((claim) => {
	// 	claimableRewards -= claim.amount;
	// 	if (claimableRewards < 0) {
	// 		claimableRewards = 0;
	// 	}
	// 	rewardsClaimed += claim.amount;
	// });

	// Get the funds staked into the campaign

	// Reward Claim callback -- receives the selected wallet as a parameter
	const handleClaim = useHandleClaim({ id, chain, campaign });
	useRecalculateFundsForCampaign(campaign);

	if (!campaign) {
		return <Serve404 />;
	}

	const claimButtonContentIfCampaignReady = isConnectedToSameChain ? (
		<ClaimButton
			onClaim={handleClaim}
			isComplete={
				typeof campaign.reward.limit === "number" && campaign.reward.limit > 0
					? rewardsClaimed >= campaign.reward.limit
					: false
			}
			wallets={walletsForChain}
			amount={claimableRewards > funds ? funds : claimableRewards}
			canClaimThisMonth={canClaimThisMonth}
			reward={campaign.reward as CampaignReward}
			active={
				true ||
				(!!verifications.captcha &&
					(campaign?.disableVerification !== true
						? !!verifications.personhood
						: true))
			}
		/>
	) : (
		<Button
			isLoading={settingChain}
			height={majorScale(7)}
			intent="success"
			appearance="primary"
			minWidth={260}
			width="100%"
			onClick={setToCampaignChain}
		>
			Switch Network to Claim Reward
		</Button>
	);
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
										partnership={fistParnershipFoundForThisCampaign}
										whitelist={campaign.whitelist}
									/>
								</Pane>
							)}
							{fistParnershipFoundForThisCampaign ? (
								<PartnershipUI
									partnership={fistParnershipFoundForThisCampaign}
									metrics={{
										isLoading: metrics.isLoading,
										data: metrics.data || null
									}}
								/>
							) : (
								<StartPartnership
									campaignChain={chain}
									campaignId={id}
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
								<Funds balance={funds} ticker={campaign.reward.ticker} />
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
					{fistParnershipFoundForThisCampaign && (
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
										claimButtonContentIfCampaignReady
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

type CampaignParams = {
	id: string;
	chain: string;
};
// Executes at build time
export const getStaticPaths: GetStaticPaths<CampaignParams> = async () => {
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
};

export const getStaticProps: GetStaticProps<
	CampaignPageProps,
	CampaignParams
> = async ({ params }) => {
	if (!params) {
		return {
			notFound: true
		};
	}
	if (useSeedData) {
		const campaignsData = (await import("@/seed/campaigns.json")).default;
		const campaigns = camelcaseKeys(campaignsData, { deep: true });

		return {
			props: {
				campaign: campaigns[0] as Campaign,
				id: campaigns[0].id,
				chain: campaigns[0].chain
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
