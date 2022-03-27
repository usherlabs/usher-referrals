import React, { useCallback } from "react";
import {
	Pane,
	Heading,
	Paragraph,
	Tooltip,
	HelpIcon,
	useTheme
} from "evergreen-ui";
import { css } from "@linaria/core";

import { useWallet, useContract } from "@/hooks/";
import { MAX_SCREEN_WIDTH, TABLET_BREAKPOINT } from "@/constants";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Terms";
import Progress from "@/components/Progress";

const getInviteLink = (id = "") => `${window.location.origin}/invite/${id}`;

const DashboardScreen = () => {
	const { colors } = useTheme();
	const [wallet] = useWallet();
	const [
		{
			token: { ticker },
			limit
		},
		isContractLoading
	] = useContract();
	const { id: linkId, conversions = { total: 0, pending: 0, success: 0 } } =
		wallet?.link || {};
	const inviteLink = linkId ? getInviteLink(linkId) : "";

	// "Users converted by the Advertiser that are pending for processing."
	const ConvHelpIcon = (content) =>
		useCallback(
			(props) => (
				<Tooltip content={content}>
					<HelpIcon {...props} />
				</Tooltip>
			),
			[]
		);

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
							<AffiliateLink link={inviteLink} marginBottom={12} />
							<Pane
								display="flex"
								flexDirection="row"
								alignItems="center"
								justifyContent="space-between"
							>
								<Paragraph width="100%">
									👆&nbsp;&nbsp;Share this Affiliate link to earn
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
									value={conversions.total}
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
										value={conversions.pending}
										id="pending-conv-count"
										label="Pending Conversions"
										iconRight={ConvHelpIcon(
											"Referrals enter a pending status for processing and verification."
										)}
										iconProps={{
											color: colors.gray500
										}}
									/>
								</Pane>
								<Pane width={20} />
								<Pane display="flex" flex={1}>
									<ValueCard
										value={conversions.success}
										id="success-conv-count"
										label="Successful Conversions"
										iconRight={ConvHelpIcon(
											"Once referrals have been processed, rewards for these referrals can be claimed."
										)}
										iconProps={{
											color: colors.gray500
										}}
									/>
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
						{/* <Pane display="flex" marginBottom={12}>
							<ValueCard
								ticker="AR"
								value={0}
								id="pending-rewards"
								label="Pending Rewards"
							/>
						</Pane> */}
						<Pane display="flex" marginBottom={24}>
							<ValueCard
								isLoading={isContractLoading}
								ticker={ticker}
								value={0}
								id="claimable-rewards"
								label="Claimable Rewards"
							/>
						</Pane>
						<Pane display="flex">
							<ClaimButton />
						</Pane>
					</Pane>
					<Pane marginBottom={12}>
						<Terms />
					</Pane>
				</Pane>
			</Pane>
		</Pane>
	);
};

DashboardScreen.propTypes = {};

export default DashboardScreen;
