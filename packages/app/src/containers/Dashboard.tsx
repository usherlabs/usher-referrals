import React, { useState, useCallback, useEffect } from "react";
import { Pane, useTheme, Dialog } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
// import useLocalStorage from "use-local-storage";
import { useRouter } from "next/router";

import { useUser } from "@/hooks/";
import Header from "@/components/Header";
// import WalletConnectScreen from "@/screens/WalletConnect";
// import EmailCaptureScreen from "@/screens/EmailCapture";
// import CaptchaScreen from "@/screens/Captcha";
import Preloader from "@/components/Preloader";
import WalletSideSheet from "@/components/WalletSideSheet";
import LogoutManager from "@/components/LogoutManager";
import ProfileSettings from "@/components/ProfileSettings";
// import handleException from "@/utils/handle-exception";
// import * as alerts from "@/utils/alerts";
import { hcaptchaSiteKey } from "@/env-config";
import useRedir from "@/hooks/use-redir";

type Props = {
	children: React.ReactNode;
};

const loadingMessages = [
	"Hold tight...",
	"Dashboard engines ready...",
	"Loading your wallets..."
];

let loadingMessageIndex = 0;

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
	const [showWallets, setShowWallets] = useState(false);
	const [showLogout, setShowLogout] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const router = useRouter();
	const loginUrl = useRedir("/login");
	// const [captureEmail, setCaptureEmail] = useLocalStorage<boolean | null>(
	// 	"get-notified",
	// 	null
	// );
	const captureEmail = false;
	const isCaptchaVerified = isEmpty(hcaptchaSiteKey) ? true : captcha;
	const [loadingMessage, setLoadingMessage] = useState(
		loadingMessages[loadingMessageIndex]
	);

	useEffect(() => {
		const loadingMessageInterval = setInterval(() => {
			if (loadingMessageIndex >= loadingMessages.length) {
				clearInterval(loadingMessageInterval);
			} else {
				setLoadingMessage(loadingMessages[loadingMessageIndex]);
				loadingMessageIndex += 1;
			}
		}, 750);
	}, []);

	useEffect(() => {
		if (!isLoading || wallets.length > 0) {
			setPreloading(false);
		}
	}, [isLoading, wallets]);

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
			router.push(loginUrl); // redirect to login page if no wallets authenticated.
			return;
		}
		if (showWallets) {
			setShowWallets(false);
			return;
		}

		setShowWallets(true);
		// Start loading wallet values -- use react-query for caching
	}, [loginUrl, wallets]);

	const onWalletSideSheetClose = useCallback(() => {
		setShowWallets(false);
	}, []);

	const onSettings = useCallback(() => {
		setShowSettings(true);
	}, []);

	const onLogout = useCallback(() => {
		setShowLogout(true);
	}, []);

	const onCloseLogout = useCallback(() => {
		setShowLogout(false);
	}, []);

	const onCloseSettings = useCallback(() => {
		setShowSettings(false);
	}, []);

	return (
		<>
			<Pane>
				{isPreloading && (
					<Preloader message={loadingMessage || loadingMessages[0]} />
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
						onSettingsClick={onSettings}
						onLogoutClick={onLogout}
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
					{/* {isEmpty(wallets) && <WalletConnectScreen />}
					{isEmpty(profile.email) && !isEmpty(wallets) && captureEmail && (
						<EmailCaptureScreen
							onSkip={onEmailCaptureSkip}
							onCapture={onEmailCapture}
						/>
					)}
					{!isEmpty(wallets) && !isCaptchaVerified && !captureEmail && (
						<CaptchaScreen />
					)}
					{!isEmpty(wallets) && isCaptchaVerified && !captureEmail && children} */}
					{children}
				</Pane>
			</Pane>
			<WalletSideSheet
				isShown={showWallets}
				onClose={onWalletSideSheetClose}
				wallets={wallets}
			/>
			<Dialog
				isShown={showLogout}
				title="Log out"
				onCloseComplete={onCloseLogout}
				hasFooter={false}
			>
				<Pane paddingBottom={40}>
					<LogoutManager />
				</Pane>
			</Dialog>
			<Dialog
				isShown={showSettings}
				title="Profile Settings"
				onCloseComplete={onCloseSettings}
				hasFooter={false}
			>
				<Pane paddingBottom={40}>
					<ProfileSettings />
				</Pane>
			</Dialog>
		</>
	);
};

export default DashboardContainer;
