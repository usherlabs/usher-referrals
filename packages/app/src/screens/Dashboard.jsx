import React from "react";
import { Pane, Heading } from "evergreen-ui";
import { css } from "@linaria/core";

import { useWallet } from "@/hooks/";
import { MAX_SCREEN_WIDTH, TABLET_BREAKPOINT } from "@/constants";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Terms";

const getInviteLink = (id = "") => `${window.location.origin}/invite/${id}`;

const DashboardScreen = () => {
	const [wallet] = useWallet();
	const linkId = wallet?.link?.id;
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
						<Pane display="flex">
							<AffiliateLink link={inviteLink} />
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
