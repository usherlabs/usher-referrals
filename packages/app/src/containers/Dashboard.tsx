import React, { useState, useCallback, useEffect } from "react";
import { Pane, useTheme, Dialog, CornerDialog } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import useLocalStorage from "use-local-storage";
import { useRouter } from "next/router";

import { useUser } from "@/hooks/";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import WalletsManager from "@/components/WalletsManager";
import LogoutManager from "@/components/LogoutManager";
import ProfileSettings from "@/components/ProfileSettings";
import EmailCapture from "@/components/EmailCapture";
import SideSheet from "@/components/SideSheet";
import { hcaptchaSiteKey } from "@/env-config";
import useRedir from "@/hooks/use-redir";
import Captcha from "@/components/Captcha";
import delay from "@/utils/delay";
import * as api from "@/api";
import Authenticate from "@/modules/auth";

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
		actions: { setProfile, setCaptcha }
	} = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const [showWallets, setShowWallets] = useState(false);
	const [showLogout, setShowLogout] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const router = useRouter();
	const loginUrl = useRedir("/login");
	const [captureEmail, setCaptureEmail] = useLocalStorage<{
		active: boolean;
		dismissCount?: number;
		remindIn?: number;
	} | null>("get-notified", null);
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

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!isLoading && wallets.length > 0 && !profile.email) {
				if (captureEmail && !captureEmail.active) {
					if (captureEmail.remindIn && captureEmail.remindIn !== 0) {
						if (Date.now() >= captureEmail.remindIn) {
							setCaptureEmail({
								...captureEmail,
								active: true
							});
						}
					}
				} else {
					setCaptureEmail({ active: true });
				}
			}
		}, 2000);

		return () => {
			clearTimeout(timeout);
		};
	}, [isLoading, wallets, profile, captureEmail]);

	const onEmailCapture = useCallback(
		(email: string) => {
			setProfile({
				...profile,
				email
			});
			setCaptureEmail({
				...captureEmail,
				active: false,
				remindIn: 0
			});
			// Save to Graph
		},
		[profile, captureEmail]
	);

	const onEmailCaptureDismiss = useCallback(() => {
		if (captureEmail) {
			const newDismissCount =
				(!captureEmail.dismissCount ? 0 : captureEmail.dismissCount) + 1;
			setCaptureEmail({
				active: false,
				dismissCount: newDismissCount,
				remindIn: Date.now() + 1000 * 60 * 60 * 24 * 3.5 * newDismissCount
			});
		}
	}, [captureEmail]);

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

	const onCaptchaSuccess = useCallback(
		async (token: string) => {
			const authInstance = Authenticate.getInstance();
			const authToken = await authInstance.getAuthToken();
			const { success: isSuccess } = await api.captcha(authToken).post(token);
			if (isSuccess) {
				await delay(1000);
				setCaptcha(true);
				return true;
			}
			return false;
		},
		[wallets]
	);

	if (!isLoading && wallets.length > 0 && !isCaptchaVerified) {
		return <Captcha onSuccess={onCaptchaSuccess} />;
	}

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
					{children}
				</Pane>
			</Pane>
			<SideSheet
				isShown={showWallets}
				onCloseComplete={onWalletSideSheetClose}
				preventBodyScrolling
			>
				<WalletsManager onClose={onWalletSideSheetClose} />
			</SideSheet>
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
			<CornerDialog
				title="🔔 Let's keep in touch"
				isShown={captureEmail?.active || false}
				onCloseComplete={onEmailCaptureDismiss}
				hasFooter={false}
				containerProps={{
					backgroundColor: colors.gray75,
					borderRadius: 20
				}}
			>
				<EmailCapture
					hasHeading={false}
					hasSkip={false}
					onSubmit={onEmailCapture}
					onDismiss={onEmailCaptureDismiss}
					inputContainerProps={{
						paddingX: 0,
						paddingBottom: 0,
						width: "100%",
						margin: 0
					}}
				/>
			</CornerDialog>
		</>
	);
};

export default DashboardContainer;
