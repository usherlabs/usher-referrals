import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";

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
	}, []);

	const makeAddress = useCallback(async () => {
		if (typeof arconnect === "object") {
			const a = await arconnect.getActiveAddress();
			setAddress(a);
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
		const {
			user: discordUser,
			session,
			error
		} = await supabase.auth.signIn({
			provider: "discord"
		});
		if (error) {
			handleException(error);
			alerts.error();
			return;
		}
		console.log(discordUser);
		console.log(session);
	}, []);

	const disconnectService = useCallback(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	const disconnectWallet = useCallback(async () => {
		await arconnect.disconnect();
	}, []);

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
				username={user.username}
				disconnectService={disconnectService}
				disconnectWallet={disconnectWallet}
			/>
			{isEmpty(address) && (
				<WalletConnectScreen
					makeAddress={makeAddress}
					connect={connectWallet}
				/>
			)}
			{isEmpty(user.username) && !isEmpty(address) && (
				<ServiceConnectScreen connect={connectService} />
			)}
		</Pane>
	);
};

export default Home;
