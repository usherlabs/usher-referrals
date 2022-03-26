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
					<Pane
						padding={12}
						marginBottom={12}
						background="tint2"
						borderRadius={8}
					>
						<Pane display="flex">
							<ValueCard
								value={linkHits}
								ticker="hits"
								id="total-referrals"
								label="Total Affiliate Link Hits"
							/>
						</Pane>
					</Pane>
					<Pane padding={12} height={200} background="tint2" borderRadius={8}>
						Hello
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
						<Progress value={0} label="0 / 100 NFTs Claimed" showPercentage />
					</Pane>
					<Pane
						padding={12}
						background="tint2"
						borderRadius={8}
						marginBottom={24}
					>
						<Pane display="flex" marginBottom={24}>
							<ValueCard
								ticker="NFT"
								value={0}
								id="claimables"
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
