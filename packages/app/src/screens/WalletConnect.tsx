import React from "react";
import { Pane, Heading, Text } from "evergreen-ui";

import WalletConnect from "@/components/WalletConnect";

const WalletConnectScreen: React.FC = () => {
	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
			marginBottom={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				👋&nbsp;&nbsp;Welcome!
			</Heading>
			<Text size={500}>To get started, connect your wallet</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<WalletConnect />
			</Pane>
		</Pane>
	);
};

WalletConnectScreen.propTypes = {};

export default WalletConnectScreen;
