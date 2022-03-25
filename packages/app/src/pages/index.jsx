import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import { useSignIn, useSignOut } from "react-supabase";

import useWallet from "@/hooks/use-wallet";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import DashboardScreen from "@/screens/Dashboard";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";
import { isProd } from "@/env-config";

const Home = () => {
	const [address, , , { getAddress, removeAddress }] = useWallet();
	const [{ user }, signIn] = useSignIn();
	const [, signOut] = useSignOut();
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

	const connectWallet = useCallback(async () => getAddress(true), [getAddress]);
	const connectEmail = useCallback(async (email) => {
		// Connect with Email
		const { error } = await signIn({
			email
		});
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	const signOutHandler = useCallback(async () => {
		const { error } = await signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
		// State is set in Auth Update.
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
				username={user?.user_metadata?.full_name}
				avatarUrl={user?.user_metadata?.avatar_url}
				disconnectService={signOutHandler}
				disconnectWallet={removeAddress}
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
