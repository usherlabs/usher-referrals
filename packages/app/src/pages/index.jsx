import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";

import { useWallet, useUser } from "@/hooks/";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import DashboardScreen from "@/screens/Dashboard";
import Preloader from "@/components/Preloader";
import { supabase } from "@/utils/supabase-client";
import { isProd } from "@/env-config";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";

const Home = () => {
	const [{ address }, , , { removeAddress }] = useWallet();
	const [user, , { signOut }] = useUser();
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		(async () => {
			// Developer
			if (!isProd) {
				const session = await supabase.auth.session();
				console.log("DEVELOPMENT USER:", session, user);
			}
		})();
	}, []);

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);
	}, []);

	const signOutHandler = useCallback(async () => {
		const { error } = await signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

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
				userProvider={user?.app_metadata?.provider}
				username={
					user?.app_metadata?.provider === "email"
						? user?.email
						: user?.user_metadata?.full_name
				}
				avatarUrl={user?.user_metadata?.avatar_url}
				signOut={signOutHandler}
				disconnect={removeAddress}
			/>
			{isEmpty(address) && <WalletConnectScreen />}
			{isEmpty(user) && !isEmpty(address) && <EmailConnectScreen />}
			{!isEmpty(user) && !isEmpty(address) && <DashboardScreen />}
		</Pane>
	);
};

export default Home;
