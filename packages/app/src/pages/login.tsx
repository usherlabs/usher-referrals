import { useEffect } from "react";
import { Pane, Heading, Text } from "evergreen-ui";
import { useRouter } from "next/router";

import { useUser } from "@/hooks";
import DashboardContainer from "@/containers/Dashboard";
import WalletConnect from "@/components/WalletConnect";

const Screen = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && wallets.length > 0) {
			const urlParams = new URLSearchParams(window.location.search);
			const redir = decodeURIComponent(urlParams.get("redir") || "");
			if (redir) {
				router.push(redir);
			} else {
				router.push("/");
			}
		}
	}, [isLoading, wallets]);

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

const Login = () => {
	return (
		<DashboardContainer>
			<Screen />
		</DashboardContainer>
	);
};

export default Login;
