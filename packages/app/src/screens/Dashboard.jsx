import React, { useCallback, useEffect, useState } from "react";
import { Pane, Heading } from "evergreen-ui";
// import PropTypes from "prop-types";
// import { CopyToClipboard } from "react-copy-to-clipboard";
// import { css } from "@linaria/core";

import { useWallet } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import AffiliateLink from "@/components/dashboard/AffiliateLink";

const getInviteLink = (id) => `${window.location.origin}/invite/${id}`;

const DashboardScreen = () => {
	const [wallet] = useWallet();
	const inviteLink = getInviteLink(wallet.address);

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
			<Pane display="flex" flexDirection="row" width="100%">
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
				<Pane width="40%" margin={6}>
					Hi
				</Pane>
			</Pane>
		</Pane>
	);
};

DashboardScreen.propTypes = {};

export default DashboardScreen;
