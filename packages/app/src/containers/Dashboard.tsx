import React, { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import useLocalStorage from "react-use-localstorage";

import { useUser } from "@/hooks/";
// import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailCaptureScreen from "@/screens/EmailCapture";
import CaptchaScreen from "@/screens/Captcha";
import Preloader from "@/components/Preloader";
// import handleException from "@/utils/handle-exception";
// import * as alerts from "@/utils/alerts";
import { hcaptchaSiteKey } from "@/env-config";

type Props = {
	children: React.ReactNode;
};

// const loadingMessages = [
// 	"Hold tight...",
// 	"Dashboard engines ready...",
// 	"Off we go..."
// ];

// let loadingMessageIndex = 0;

const DashboardContainer: React.FC<Props> = ({ children }) => {
	const {
		user,
		isLoading,
		actions: { setProfile }
	} = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const [isMounted, setMounted] = useState(false);
	const [captureEmailValue, setCaptureEmail] = useLocalStorage(
		"get-notified",
		""
	);
	const captureEmail = captureEmailValue === "yes";
	const {
		id: userId,
		profile,
		verifications: { captcha }
	} = user;
	const isCaptchaVerified = isEmpty(hcaptchaSiteKey) ? true : captcha;
	// const [loadingMessage, setLoadingMessage] = useState(
	// 	loadingMessages[loadingMessageIndex]
	// );

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

	// useEffect(() => {
	// 	const loadingMessageInterval = setInterval(() => {
	// 		if (loadingMessageIndex > loadingMessages.length) {
	// 			clearInterval(loadingMessageInterval);
	// 		} else {
	// 			setLoadingMessage(loadingMessages[loadingMessageIndex]);
	// 			loadingMessageIndex += 1;
	// 		}
	// 	}, 750);
	// }, []);

	const onConnect = useCallback(() => {
		if (!profile.email) {
			setCaptureEmail("yes");
		}
	}, [profile]);

	const onEmailCapture = useCallback(
		(email: string) => {
			setProfile({
				...profile,
				email
			});
			setCaptureEmail("");
		},
		[profile]
	);

	const onEmailCaptureSkip = useCallback(() => {
		setCaptureEmail("");
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
				<Preloader message={`Hold tight...`} />
			)}
			{/* <Header user={user} disconnect={disconnect} /> */}
			{isEmpty(userId) && <WalletConnectScreen onConnect={onConnect} />}
			{isEmpty(profile.email) && !isEmpty(userId) && captureEmail && (
				<EmailCaptureScreen
					onSkip={onEmailCaptureSkip}
					onCapture={onEmailCapture}
				/>
			)}
			{!isEmpty(userId) && !isCaptchaVerified && !captureEmail && (
				<CaptchaScreen />
			)}
			{!isEmpty(userId) && isCaptchaVerified && !captureEmail && children}
		</Pane>
	);
};

export default DashboardContainer;
