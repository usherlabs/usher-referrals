import React, { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";

import { useWallet, useUser } from "@/hooks/";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import CaptchaScreen from "@/screens/Captcha";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { hcaptchaSiteKey } from "@/env-config";

type Props = {
	children: React.ReactNode;
};

const loadingMessages = [
	"Hold tight...",
	"Dashboard engines ready...",
	"Off we go..."
];

let loadingMessageIndex = 0;

const DashboardContainer: React.FC<Props> = ({ children }) => {
	const {
		wallet: { address },
		isLoading: isWalletLoading,
		actions: { removeWallet }
	} = useWallet();
	const {
		user,
		isLoading: isUserLoading,
		actions: { signOut }
	} = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const [isMounted, setMounted] = useState(false);
	const isLoading = isWalletLoading || isUserLoading;
	const isCaptchaVerified = isEmpty(hcaptchaSiteKey)
		? true
		: user?.verifications?.captcha === true;
	const [loadingMessage, setLoadingMessage] = useState(
		loadingMessages[loadingMessageIndex]
	);

	useEffect(() => {
		// Cancel preloader
		if (isLoading && !isMounted) {
			return () => {};
		}
		setMounted(true);
		const timeout = setTimeout(() => {
			setPreloading(false);
		}, 500);
		return () => {
			clearTimeout(timeout);
		};
	}, [isLoading]);

	const signOutHandler = useCallback(async () => {
		const { error } = await signOut();
		if (error) {
			handleException(error, null);
			alerts.error();
		}
	}, []);

	useEffect(() => {
		const loadingMessageInterval = setInterval(() => {
			if (loadingMessageIndex > loadingMessages.length) {
				clearInterval(loadingMessageInterval);
			} else {
				setLoadingMessage(loadingMessages[loadingMessageIndex]);
				loadingMessageIndex += 1;
			}
		}, 750);
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
			{(isPreloading || (isLoading && !isMounted)) && (
				<Preloader message={loadingMessage} />
			)}
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
				disconnect={removeWallet}
			/>
			{isEmpty(address) && <WalletConnectScreen />}
			{isEmpty(user) && !isEmpty(address) && <EmailConnectScreen />}
			{!isEmpty(user) && !isEmpty(address) && !isCaptchaVerified && (
				<CaptchaScreen />
			)}
			{!isEmpty(user) && !isEmpty(address) && isCaptchaVerified && children}
		</Pane>
	);
};

export default DashboardContainer;
