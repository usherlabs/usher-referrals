import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";

import useUser from "@/hooks/use-user";
import useWallet from "@/hooks/use-wallet";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import DashboardScreen from "@/screens/Dashboard";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";
import delay from "@/utils/delay";
import { isProd } from "@/env-config";
import events from "@/utils/events";
import saveWallet from "@/actions/save-wallet";

const Home = () => {
	const [address, { getAddress }] = useWallet();
	const [user] = useUser();
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		(async () => {
			// Developer
			if (!isProd) {
				const session = await supabase.auth.session();
				console.log("DEVELOPMENT MODE:", session, user);
			}
		})();
	}, []);

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);
	}, []);

	const connectWallet = useCallback(async () => {
		try {
			const a = await getAddress(true);

			// 1. Check if a user is authorised.
			// 2. Check if there is a wallet associated to this user.
			// 3. If so, and wallet does not match the authorised user's wallet, insert it.
			if (!isEmpty(user)) {
				try {
					await saveWallet(user, a);
				} catch (error) {
					handleException(error);
					alerts.error();
				}
			}
		} catch (e) {
			// Will throw where user cancels.
		}
	}, [user]);

	// const connectService = useCallback(async () => {
	// 	// Connect to Discord
	// 	const { error } = await supabase.auth.signIn(
	// 		{
	// 			provider: "discord"
	// 		},
	// 		{
	// 			scopes: "identify guilds.join" // https://github.com/supabase/gotrue-js/blob/12d02c35209bbd9f8f51af8d0aeee5e86fcc2a6e/src/GoTrueApi.ts#L68
	// 		}
	// 	);
	// 	if (error) {
	// 		handleException(error);
	// 		alerts.error();
	// 	}
	// }, []);

	const connectEmail = useCallback(async (email) => {
		// Connect with Email
		const { error } = await supabase.auth.signIn({
			email
		});
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	const disconnectService = useCallback(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
		// State is set in Auth Update.
	}, []);

	const disconnectWallet = useCallback(async () => {
		arconnect.disconnect();

		await delay(500);
		setAddress("");
	}, [arconnect]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{isPreloading && <Preloader />}
			<Header
				walletAddress={address}
				userProvider={user.app_metadata?.provider}
				username={user.user_metadata?.full_name}
				avatarUrl={user.user_metadata?.avatar_url}
				disconnectService={disconnectService}
				disconnectWallet={disconnectWallet}
			/>
			{isEmpty(address) && <WalletConnectScreen connect={connectWallet} />}
			{isEmpty(user) && !isEmpty(address) && (
				<EmailConnectScreen connect={connectEmail} />
			)}
			{!isEmpty(user) && !isEmpty(address) && <DashboardScreen />}
		</Pane>
	);
};

export default Home;
