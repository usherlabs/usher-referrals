import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import Url from "url-parse";

import Header from "@/components/Header";
import WalletConnectScreen from "@/components/WalletConnectScreen";
import ServiceConnectScreen from "@/components/ServiceConnectScreen";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";

const Home = () => {
	const arconnect = useArConnect();
	const [address, setAddress] = useState("");
	const [user, setUser] = useState({});
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);

		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				setUser(u);
				console.log(u);

				// const { user: u2 } = await supabase.auth.api.getUser(
				// 	'ACCESS_TOKEN_JWT',
				// )
			}
		}

		// If Awaiting Discord Access Token, read from URL -- Condition should trigger after redirect back from Discord Auth
		// const cookies = parseCookies();
		// if(!isEmpty(cookies.awaiting_discord_access_token)){
		// 	destroyCookie(null, 'awaiting_discord_access_token');

		// 	const
		// }
	}, []);

	const makeAddress = useCallback(async () => {
		if (typeof arconnect === "object") {
			try {
				const a = await arconnect.getActiveAddress();
				setAddress(a);
			} catch (e) {
				// ... ArConnect is loaded but has been disconnected.
			}
		}
	}, [arconnect]);

	const connectWallet = useCallback(async () => {
		await arconnect.connect(["ACCESS_ADDRESS"], {
			name: "Usher",
			logo: "/static/logo/Logo-Icon-Light.png"
		});

		makeAddress();
	}, [arconnect, makeAddress]);

	const connectService = useCallback(async () => {
		// Connect to Discord
		const { error } = await supabase.auth.signIn({
			provider: "discord"
		});
		if (error) {
			handleException(error);
			alerts.error();
		}
		// Use Cookies to store a flag indicating that we're awaiting an Access Token
		setCookie(null, "awaiting_discord_access_token", Date.now(), {
			maxAge: 60 * 60, // 1 hour
			path: "/"
		});
	}, []);

	const disconnectService = useCallback(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			handleException(error);
			alerts.error();
			return;
		}

		setUser({});
	}, []);

	const disconnectWallet = useCallback(async () => {
		arconnect.disconnect();

		setAddress("");
	}, [arconnect]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			padding={16}
			maxWidth={1280}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{isPreloading && <Preloader />}
			<Header
				walletAddress={address}
				username={user.user_metadata?.name}
				avatarUrl={user.user_metadata?.avatar_url}
				disconnectService={disconnectService}
				disconnectWallet={disconnectWallet}
			/>
			{isEmpty(address) && (
				<WalletConnectScreen
					makeAddress={makeAddress}
					connect={connectWallet}
				/>
			)}
			{isEmpty(user) && !isEmpty(address) && (
				<ServiceConnectScreen connect={connectService} />
			)}
		</Pane>
	);
};

export default Home;
