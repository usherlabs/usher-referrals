import React, { useCallback, useEffect, useState } from "react";
import { Pane, Heading, TextInput, ClipboardIcon, toaster } from "evergreen-ui";
// import PropTypes from "prop-types";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { css } from "@linaria/core";

import { useWallet } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import InputField from "@/components/InputField";

const getInviteLink = (id) => `${window.location.origin}/invite/${id}`;

const DashboardScreen = () => {
	const [wallet, isLoading] = useWallet();
	const inviteLink = getInviteLink(wallet.address);

	const onCopy = useCallback(() => {
		toaster.notify("Affiliate link has been copied!", {
			id: "link-copy"
		});
	}, []);

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
							<CopyToClipboard text={inviteLink} onCopy={onCopy}>
								<InputField
									label="Affiliate Link"
									iconRight={ClipboardIcon}
									iconSize={18}
									background="tint2"
									cursor="pointer"
									inputContainerProps={{
										className: css`
											:active {
												background: rgb(240, 240, 240) !important;
												transition: background 0.25s;
											}
										`
									}}
								>
									<TextInput
										placeholder="Loading your shareable link..."
										disabled={isLoading}
										readOnly
										value={isLoading ? "" : inviteLink}
										height={42}
										width="100%"
										border="none"
										cursor="pointer"
									/>
								</InputField>
							</CopyToClipboard>
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
