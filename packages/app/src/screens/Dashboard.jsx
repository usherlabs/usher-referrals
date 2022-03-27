import React from "react";
import { Pane, Heading, Paragraph } from "evergreen-ui";
import { css } from "@linaria/core";

import { useWallet } from "@/hooks/";
import { MAX_SCREEN_WIDTH, TABLET_BREAKPOINT } from "@/constants";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Terms";
import Progress from "@/components/Progress";

const getInviteLink = (id = "") => `${window.location.origin}/invite/${id}`;

const DashboardScreen = () => {
	const [wallet] = useWallet();
	const linkId = wallet?.link?.id;
	const linkHits = wallet?.link?.hits;
	const inviteLink = linkId ? getInviteLink(linkId) : "";

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
							Performance
						</Heading>
						<Pane
							padding={12}
							marginBottom={12}
							background="tint2"
							borderRadius={8}
						>
							<Pane display="flex" marginBottom={24}>
								<ValueCard
									value={linkHits}
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
										value={0}
										id="pending-conv-count"
										label="Pending Conversions"
									/>
								</Pane>
								<Pane width={20} />
								<Pane display="flex" flex={1}>
									<ValueCard
										value={0}
										id="success-conv-count"
										label="Successful Conversions"
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
					<Pane
						background="tint2"
						borderRadius={8}
						padding={12}
						marginBottom={12}
					>
						{/* TODO: Make this configurable -- this block will only show when there's a program limit too */}
						<Progress value={0} label="0 / 60 AR Claimed" showPercentage />
					</Pane>
					<Pane
						padding={12}
						background="tint2"
						borderRadius={8}
						marginBottom={24}
					>
						<Pane display="flex" marginBottom={12}>
							<ValueCard
								ticker="AR"
								value={0}
								id="pending-rewards"
								label="Pending Rewards"
							/>
						</Pane>
						<Pane display="flex" marginBottom={24}>
							<ValueCard
								ticker="AR"
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
