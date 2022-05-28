import React, { useState, useCallback, useEffect } from "react";
import { Pane, useTheme } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import useLocalStorage from "use-local-storage";
import { useRouter } from "next/router";

import { useUser } from "@/hooks/";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailCaptureScreen from "@/screens/EmailCapture";
import CaptchaScreen from "@/screens/Captcha";
import Preloader from "@/components/Preloader";
import WalletSideSheet from "@/components/WalletSideSheet";
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

const HEADER_HEIGHT = 70 as const;

const DashboardContainer: React.FC<Props> = ({ children }) => {
	const { colors } = useTheme();
	const {
		user: {
			wallets,
			profile,
			verifications: { captcha }
		},
		isLoading,
		actions: { setProfile }
	} = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const [isMounted, setMounted] = useState(false);
	const [showWallets, setShowWallets] = useState(true);
	const router = useRouter();
	// const [captureEmail, setCaptureEmail] = useLocalStorage<boolean | null>(
	// 	"get-notified",
	// 	null
	// );
	const captureEmail = false;
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

	// const onConnect = useCallback(() => {
	// 	if (!profile.email) {
	// 		setCaptureEmail(true);
	// 	}
	// }, [profile]);

	const onEmailCapture = useCallback(
		(email: string) => {
			setProfile({
				...profile,
				email
			});
			// setCaptureEmail(false);
		},
		[profile]
	);

	const onEmailCaptureSkip = useCallback(() => {
		// setCaptureEmail(false);
	}, []);

	const onWalletToggle = useCallback(() => {
		if (wallets.length === 0) {
			router.push("/login"); // redirect to login page if no wallets authenticated.
			return;
		}
		if (showWallets) {
			setShowWallets(false);
			return;
		}

		setShowWallets(true);
		// Start loading wallet values -- use react-query for caching
	}, [wallets]);

	const onWalletSideSheetClose = useCallback(() => {
		setShowWallets(false);
	}, []);

	return (
		<>
			<Pane>
				{(isPreloading || (isLoading && !isMounted)) && (
					<Preloader message={`Hold tight...`} />
				)}
				<Pane
					position="fixed"
					left={0}
					right={0}
					top={0}
					height={HEADER_HEIGHT}
					borderBottomWidth={2}
					borderBottomColor={colors.gray300}
					borderBottomStyle="solid"
					zIndex={10}
				>
					<Header
						height={HEADER_HEIGHT}
						walletCount={wallets.length}
						onWalletClick={onWalletToggle}
					/>
				</Pane>
				<Pane
					display="flex"
					flexDirection="column"
					marginY="0"
					marginX="auto"
					minHeight="100vh"
					position="relative"
					paddingTop={HEADER_HEIGHT}
				>
					{isEmpty(wallets) && <WalletConnectScreen />}
					{isEmpty(profile.email) && !isEmpty(wallets) && captureEmail && (
						<EmailCaptureScreen
							onSkip={onEmailCaptureSkip}
							onCapture={onEmailCapture}
						/>
					)}
					{!isEmpty(wallets) && !isCaptchaVerified && !captureEmail && (
						<CaptchaScreen />
					)}
					{!isEmpty(wallets) && isCaptchaVerified && !captureEmail && children}
				</Pane>
			</Pane>
			<WalletSideSheet
				isShown={showWallets}
				onClose={onWalletSideSheetClose}
				wallets={wallets}
			/>
		</>
	);
};

export default DashboardContainer;
