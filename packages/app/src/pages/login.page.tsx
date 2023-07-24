import { useEffect, useState } from "react";
import { Heading, Pane, Text } from "evergreen-ui";
import { useRouter } from "next/router";

import { useUser } from "@/hooks";
import WalletConnect from "@/components/connect/WalletConnect";

const Login = () => {
	const {
		user: { wallets }
	} = useUser();
	const router = useRouter();
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		if (wallets.length > 0) {
			setLoading(true);
			const redir = decodeURIComponent((router.query.redir as string) || "");
			if (redir) {
				router.push(redir);
			} else {
				router.push("/");
			}
		}
	}, [wallets, router]);

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
				<WalletConnect loading={isLoading} />
			</Pane>
		</Pane>
	);
};

export default Login;
