// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

import { useUser } from "@/hooks";
import DashboardScreen from "@/screens/Dashboard";

import {
	Pane,
	Heading,
	Paragraph,
	Tooltip,
	HelpIcon,
	useTheme,
	Alert
} from "evergreen-ui";
import { css } from "@linaria/core";
// import { Usher } from "usher-js";

import { useUser, useContract } from "@/hooks/";
import { MAX_SCREEN_WIDTH, TABLET_BREAKPOINT } from "@/constants";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Terms";
import Progress from "@/components/Progress";
import getInviteLink from "@/utils/get-invite-link";

const Partnerships = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();
	const { id } = router.query;

	return (
		const { colors } = useTheme();
	const {gi
		contract: {
			rate,
			token: { ticker },
			limit
		},
		isLoading: isContractLoading
	} = useContract();
	const { user, partnerships } = useUser();
	// const inviteLink = linkId ? getInviteLink(linkId) : "";
	// const claimableRewards = rate * conversions.pending;

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
			maxWidth={MAX_SCREEN_WIDTH}
			marginX="auto"
			padding={16}
			width="100%"
		>
			<Heading is="h1" size={900} textAlign="left" width="100%" padding={6}>
				Let&apos;s get sharing!
			</Heading>
			<Pane
				display="flex"
				flexDirection="row"
				width="100%"
				className={css`
					@media (max-width: ${TABLET_BREAKPOINT}px) {
						flex-direction: column !important;
					}
				`}
			>
				<Pane flex={1} margin={6}>
					<Pane
						padding={12}
						background="tint2"
						borderRadius={8}
						marginBottom={12}
					>
						<Pane display="flex" flexDirection="column">
							{/* <AffiliateLink link={inviteLink} marginBottom={12} /> */}
							<Pane
								display="flex"
								flexDirection="row"
								alignItems="center"
								justifyContent="space-between"
							>
								<Paragraph width="100%">
									👆&nbsp;&nbsp;Click and Copy to share this Affiliate link and
									earn
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
								{/* <ValueCard
									value={conversions.total}
									ticker="hits"
									id="total-referrals"
									label="Affiliate Link Hits"
								/> */}
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
									{/* <ValueCard
										value={conversions.pending}
										id="pending-conv-count"
										label="Pending Conversions"
										iconRight={ConvHelpIcon(
											"Pending Conversions are referrals that have been converted to users on the advertising partner's application. These are considered pending as conversions are yet to have associated rewards allocated."
										)}
										iconProps={{
											color: colors.gray500
										}}
									/> */}
								</Pane>
								<Pane width={20} />
								<Pane display="flex" flex={1}>
									{/* <ValueCard
										value={conversions.success}
										id="success-conv-count"
										label="Successful Conversions"
										iconRight={ConvHelpIcon(
											"Successful Conversions are converted referrals where rewards are guaranteed for the Affiliate."
										)}
										iconProps={{
											color: colors.gray500
										}}
									/> */}
								</Pane>
							</Pane>
						</Pane>
					</Pane>
				</Pane>
				<Pane
					width="40%"
					margin={6}
					className={css`
						@media (max-width: ${TABLET_BREAKPOINT}px) {
							width: 100% !important;
						}
					`}
				>
					{limit > 0 && !isContractLoading && (
						<Pane
							background="tint2"
							borderRadius={8}
							padding={12}
							marginBottom={12}
						>
							{/* TODO: Make this configurable -- this block will only show when there's a program limit too */}
							<Progress
								value={0}
								label={`0 / ${limit} AR Claimed`}
								showPercentage
							/>
						</Pane>
					)}
					<Pane
						padding={12}
						background="tint2"
						borderRadius={8}
						marginBottom={24}
					>
						<Pane display="flex" marginBottom={24}>
							{/* <ValueCard
								isLoading={isContractLoading as boolean}
								ticker={ticker}
								value={claimableRewards}
								id="claimable-rewards"
								label="Claimable Rewards"
							/> */}
						</Pane>
						<Pane display="flex">
							<ClaimButton />
						</Pane>
					</Pane>
					<Pane marginBottom={12}>
						<Tooltip
							content="This feature is still in development."
							statelessProps={{
								minWidth: 280
							}}
						>
							<Alert intent="warning" title="Unlock Claims">
								<Paragraph>
									Verify your personhood to unlock the ability to submit claims.
								</Paragraph>
							</Alert>
						</Tooltip>
					</Pane>
					<Pane marginBottom={12}>
						<Terms />
					</Pane>
				</Pane>
			</Pane>
		</Pane>
	);
};

export default Partnerships;
