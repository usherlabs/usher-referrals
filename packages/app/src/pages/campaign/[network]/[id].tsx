// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import {
	Pane,
	Heading,
	Paragraph,
	Strong,
	Tooltip,
	HelpIcon,
	useTheme,
	Alert,
	Button,
	majorScale
} from "evergreen-ui";
import { css } from "@linaria/core";
import camelcaseKeys from "camelcase-keys";

import { useUser, useRandomColor } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Terms";
import Progress from "@/components/Progress";
import Anchor from "@/components/Anchor";
import getInviteLink from "@/utils/get-invite-link";
import delay from "@/utils/delay";
import { Wallet, Chains, Partnership, Campaign, RewardTypes } from "@/types";
import truncate from "@/utils/truncate";
import { UilTwitter } from "@iconscout/react-unicons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useRedir from "@/hooks/use-redir";

const getCampaign = async (id: string, network: Chains) => {
	await delay(5000);
	const campaignsData = (await import("@/seed/campaigns.json")).default;
	const campaigns = camelcaseKeys(campaignsData, { deep: true });

	return campaigns[0];
};

const Partnerships = () => {
	const {
		user: { wallets }
	} = useUser();
	const router = useRouter();
	const { colors } = useTheme();
	const rColor = useRandomColor();
	const { id, network } = router.query;
	const campaign = useQuery("campaign", () =>
		getCampaign(id as string, network as Chains)
	);
	const loginUrl = useRedir("/login");
	const isLoggedIn = wallets.length > 0;
	const partnerships = isLoggedIn
		? wallets
				.filter((w) => w.chain === network)
				.reduce<Partnership[]>((p, wallet) => {
					return p.concat(wallet.partnerships);
				}, [])
		: [];
	const partnership = partnerships.find(
		(p) => p.campaign.address === id && p.campaign.network === network
	);

	// "Users converted by the Advertiser that are pending for processing."
	const ConvHelpIcon = (content: string) =>
		useCallback(
			(props: any) => (
				<Tooltip content={content} statelessProps={{ minWidth: 340 }}>
					<HelpIcon {...props} />
				</Tooltip>
			),
			[]
		);

	const onStartPartnership = useCallback(() => {
		if (!isLoggedIn) {
			router.push(loginUrl);
			return;
		}
		console.log("hello world");
	}, [loginUrl, isLoggedIn]);

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

	return (
		<Pane
			display="flex"
			alignItems="center"
			flexDirection="column"
			maxWidth={MAX_SCREEN_WIDTH - 32}
			marginX="auto"
			width="100%"
		>
			<Pane
				borderBottom
				height={200}
				backgroundImage={`url(${
					!campaign.isLoading && campaign.data
						? campaign.data.details.image
						: ""
				})`}
				backgroundPosition="center"
				backgroundSize="cover"
				backgroundColor={rColor}
				backgroundRepeat="no-repeat"
				boxShadow="inset 0 -5px 20px rgba(0, 0, 0, 0.25)"
				position="relative"
				borderBottomLeftRadius={12}
				borderBottomRightRadius={12}
			>
				{!campaign.isLoading &&
					campaign.data &&
					campaign.data.advertiser.icon && (
						<Pane
							borderRadius={12}
							borderBottomLeftRadius={0}
							borderBottomRightRadius={0}
							height={50}
							backgroundImage={`url(${campaign.data.advertiser.icon})`}
							backgroundSize="contain"
							backgroundRepeat="no-repeat"
							backgroundPosition="center"
							border="5px solid #fff"
							borderBottom="none"
							backgroundColor="#fff"
							maxWidth={150}
							position="absolute"
							left={16}
							bottom={16}
						/>
					)}
			</Pane>
			<Pane padding={16}>
				{!campaign.isLoading && campaign.data ? (
					<Pane
						display="flex"
						flexDirection="row"
						alignItems="flex-start"
						justifyContent="space-between"
					>
						<Pane flex={1}>
							<Heading is="h1" size={900} textAlign="left" width="100%">
								{campaign.data.details.name}
							</Heading>
							<Heading size={500} fontWeight={400} color={colors.gray900}>
								By{" "}
								<Anchor href={campaign.data.advertiser.externalLink} external>
									<Strong>
										{campaign.data.advertiser.name
											? campaign.data.advertiser.name
											: truncate(campaign.data.owner, 6, 4)}
									</Strong>
								</Anchor>
							</Heading>
							{campaign.data.details.description && (
								<Paragraph size={500} marginTop={10}>
									{campaign.data.details.description}
								</Paragraph>
							)}
						</Pane>
						<Pane width="40%">
							{campaign.data.advertiser.description && (
								<Paragraph size={500} marginTop={10}>
									{campaign.data.advertiser.description}
								</Paragraph>
							)}
							<Pane>
								{campaign.data.advertiser.twitter && (
									<Anchor href={campaign.data.advertiser.twitter} external>
										<Button
											appearance="primary"
											backgroundColor={colors.gray900}
										>
											<Strong color="#fff">
												<UilTwitter size="28" />
											</Strong>
										</Button>
									</Anchor>
								)}
							</Pane>
						</Pane>
					</Pane>
				) : (
					<Skeleton count={5} />
				)}
			</Pane>
			<Pane
				display="flex"
				flexDirection="row"
				width="100%"
				padding={16}
				// className={css`
				// 	@media (max-width: ${TABLET_BREAKPOINT}px) {
				// 		flex-direction: column !important;
				// 	}
				// `}
			>
				<Pane flex={1} margin={6}>
					{partnership ? (
						<>
							<Pane
								padding={12}
								background="tint2"
								borderRadius={8}
								marginBottom={12}
							>
								<Pane display="flex" flexDirection="column">
									<AffiliateLink
										link={getInviteLink(partnership.id)}
										marginBottom={12}
									/>
									<Pane
										display="flex"
										flexDirection="row"
										alignItems="center"
										justifyContent="space-between"
									>
										<Paragraph width="100%">
											👆&nbsp;&nbsp;Click and Copy to share this Affiliate link
											and earn
										</Paragraph>
									</Pane>
								</Pane>
							</Pane>
							<Pane>
								<Heading size={500} paddingY={12}>
									Overview
								</Heading>
								<Pane
									padding={12}
									marginBottom={12}
									background="tint2"
									borderRadius={8}
								>
									<Pane display="flex" marginBottom={24}>
										<ValueCard
											// value={conversions.total}
											value={0}
											ticker="hits"
											id="total-referrals"
											label="Affiliate Link Hits"
										/>
									</Pane>
									<Pane
										display="flex"
										flexDirection="row"
										width="100%"
										className={css`
											@media (max-width: 767px) {
												flexdirection: column !important;
											}
										`}
									>
										<Pane display="flex" flex={1}>
											<ValueCard
												// value={conversions.pending}
												value={0}
												id="pending-conv-count"
												label="Pending Conversions"
												iconRight={ConvHelpIcon(
													"Pending Conversions are referrals that have been converted to users on the advertising partner's application. These are considered pending as conversions are yet to have associated rewards allocated."
												)}
												iconProps={{
													color: colors.gray500
												}}
											/>
										</Pane>
										<Pane width={20} />
										<Pane display="flex" flex={1}>
											<ValueCard
												// value={conversions.success}
												value={0}
												id="success-conv-count"
												label="Successful Conversions"
												iconRight={ConvHelpIcon(
													"Successful Conversions are converted referrals where rewards are guaranteed for the Affiliate."
												)}
												iconProps={{
													color: colors.gray500
												}}
											/>
										</Pane>
									</Pane>
								</Pane>
							</Pane>
						</>
					) : (
						<Pane
							border
							borderRadius={8}
							display="flex"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							height={300}
						>
							<Button
								height={majorScale(7)}
								appearance="primary"
								onClick={onStartPartnership}
							>
								<Strong color="#fff">👉&nbsp;&nbsp;Start a Partnership</Strong>
							</Button>
						</Pane>
					)}
				</Pane>
				<Pane
					width="40%"
					margin={6}
					// className={css`
					// 	@media (max-width: ${TABLET_BREAKPOINT}px) {
					// 		width: 100% !important;
					// 	}
					// `}
				>
					{!campaign.isLoading && campaign.data ? (
						<Pane
							background="tint2"
							borderRadius={8}
							padding={12}
							marginBottom={12}
						>
							<Progress
								value={0}
								label={`${0} / ${campaign.data.reward.limit} ${
									campaign.data.reward.ticker
								}${
									campaign.data.reward.type !== RewardTypes.TOKEN
										? ` ${campaign.data.reward.type.toUpperCase()}s`
										: ""
								} Claimed`}
								showPercentage
							/>
						</Pane>
					) : (
						<Skeleton
							style={{
								height: 100,
								borderRadius: 8
							}}
						/>
					)}
					{isLoggedIn && (
						<>
							<Pane
								padding={12}
								background="tint2"
								borderRadius={8}
								marginBottom={24}
							>
								<Pane display="flex" marginBottom={24}>
									{!campaign.isLoading && campaign.data ? (
										<ValueCard
											// isLoading={false}
											ticker={campaign.data.reward.ticker}
											// value={claimableRewards}
											value={0}
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
									{!campaign.isLoading && campaign.data ? (
										<ClaimButton />
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
								{!campaign.isLoading && campaign.data ? (
									<Alert intent="warning" title="Unlock Claims">
										<Paragraph marginBottom={12}>
											Verify your personhood to unlock the ability to submit
											claims.
										</Paragraph>
										<Button height={majorScale(4)}>
											<Strong>Verify your personhood</Strong>
										</Button>
									</Alert>
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
						{!campaign.isLoading && campaign.data ? (
							<Terms campaign={campaign.data as Campaign} />
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

export default Partnerships;
