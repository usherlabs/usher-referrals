import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";

import { useWallet, useUser } from "@/hooks/";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import CaptchaScreen from "@/screens/Captcha";
import DashboardScreen from "@/screens/Dashboard";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { hcaptchaSiteKey } from "@/env-config";

console.log(hcaptchaSiteKey);

const Home = () => {
	const [{ address }, isWalletLoading, , { removeAddress }] = useWallet();
	const [user, isUserLoading, { signOut }] = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const isLoading = isWalletLoading || isUserLoading;
	const isCaptchaVerified = isEmpty(hcaptchaSiteKey)
		? true
		: user?.verifications?.captcha === true;

	useEffect(() => {
		// Cancel preloader
		const timeout = setTimeout(() => {
			setPreloading(false);
		}, 500);

		return () => {
			clearTimeout(timeout);
		};
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
			{(isPreloading || isLoading) && <Preloader />}
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
			{!isEmpty(user) && !isEmpty(address) && !isCaptchaVerified && (
				<CaptchaScreen />
			)}
			{!isEmpty(user) && !isEmpty(address) && isCaptchaVerified && (
				<DashboardScreen />
			)}
		</Pane>
	);
};

export default Home;
