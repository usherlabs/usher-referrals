import React, { useCallback, useEffect, useState } from "react";
import {
	CornerDialog,
	Dialog,
	Heading,
	Pane,
	Spinner,
	toaster
} from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import useLocalStorage from "use-local-storage";
import { useRouter } from "next/router";
import { css } from "@linaria/core";

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
import handleException from "@/utils/handle-exception";
import { userFetched } from "@/providers/user/User";
import * as mediaQueries from "@/utils/media-queries";
import SideMenu from "@/components/SideMenu";
import { useCustomTheme } from "@/brand/themes/theme";
import { PoweredByUsher } from "@/components/PoweredByUsher";
import { brandConfig } from "@/brand";
import { ManageWalletsConnection } from "@/utils/user-state-management/components/ManageWalletsConnection";

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
const SIDEMENU_WIDTH = 280 as const;

const DashboardContainer: React.FC<Props> = ({ children }) => {
	const { colors } = useCustomTheme();
	const {
		auth,
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
	const [isCapturingEmail, setCapturingEmail] = useState(false);
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
		// User is fetched, not loading, authorised, and does already have an profile.email
		if (!isLoading && userFetched() && wallets.length > 0) {
			if (profile.email && captureEmail?.active) {
				setCaptureEmail({
					...captureEmail,
					active: false,
					remindIn: 0 // never remind again
				});
			} else if (captureEmail) {
				if (
					!captureEmail.active &&
					captureEmail.remindIn &&
					captureEmail.remindIn !== 0
				) {
					if (Date.now() >= captureEmail.remindIn) {
						setCaptureEmail({
							...captureEmail,
							active: true
						});
					}
				}
			} else {
				// setCaptureEmail({ active: true });

				// On first visit, remind about email in a day
				setCaptureEmail({
					active: false,
					remindIn: Date.now() + 1000 * 60 * 60 * 24
				});
			}
		}
	}, [isLoading, profile, captureEmail, wallets, setCaptureEmail]);

	const onEmailCapture = useCallback(
		async (email: string) => {
			setCapturingEmail(true);
			try {
				await setProfile({
					...profile,
					email
				});
				setCaptureEmail({
					...captureEmail,
					active: false,
					remindIn: 0
				});
				toaster.success("Your profile has been updated!");
			} catch (e) {
				handleException(e);
				toaster.danger(
					"An issue occurred saving your profile. Please refresh and try again."
				);
			} finally {
				setCapturingEmail(false);
			}
		},
		[profile, captureEmail, setCaptureEmail, setProfile]
	);

	const onEmailCaptureDismiss = useCallback(() => {
		if (captureEmail && captureEmail.remindIn !== 0) {
			const newDismissCount =
				(!captureEmail.dismissCount ? 0 : captureEmail.dismissCount) + 1;
			setCaptureEmail({
				active: false,
				dismissCount: newDismissCount,
				remindIn: Date.now() + 1000 * 60 * 60 * 24 * 3.5 * newDismissCount
			});
		}
	}, [captureEmail, setCaptureEmail]);

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
	}, [loginUrl, router, showWallets, wallets.length]);

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
			try {
				const authToken = await auth.getAuthToken();
				const { success: isSuccess } = await api.captcha(authToken).post(token);
				if (isSuccess) {
					await delay(1000);
					setCaptcha(true);
					return true;
				}
			} catch (e) {
				handleException(e);
				toaster.danger(
					"Something has gone wrong. Please refresh and try again."
				);
			}
			return false;
		},
		[auth, setCaptcha]
	);

	if (!isLoading && wallets.length > 0 && !isCaptchaVerified) {
		return (
			<Pane display="flex" minHeight="100vh" width="100%">
				<Captcha onSuccess={onCaptchaSuccess} />
			</Pane>
		);
	}

	return (
		<>
			<Pane
				className={css`
					min-height: 100vh;
					display: flex;
					flex-direction: column;

					${mediaQueries.gtLarge} {
						flex-direction: row !important;
					}
				`}
			>
				{isPreloading && (
					<Preloader message={loadingMessage || loadingMessages[0]} />
				)}
				<SideMenu width={SIDEMENU_WIDTH} />
				<Pane
					top={0}
					right={0}
					height={HEADER_HEIGHT}
					className={css`
						${mediaQueries.gtLarge} {
							position: absolute !important;
							margin-left: 0px !important;
							padding: 20px !important;
						}
					`}
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
					flex="1"
					display="grid"
					marginLeft={SIDEMENU_WIDTH}
					className={css`
						${mediaQueries.isLarge} {
							margin-left: 0px !important;
							padding: 10px !important;
						}
					`}
				>
					{children}
					{brandConfig.rebranded && (
						<Pane marginTop={"auto"} marginBottom={8} marginX={"auto"}>
							<PoweredByUsher />
						</Pane>
					)}
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
				isShown={!isLoading && (captureEmail?.active || false)}
				onCloseComplete={onEmailCaptureDismiss}
				hasFooter={false}
				containerProps={{
					backgroundColor: colors.gray75,
					borderRadius: 20,
					zIndex: 5,
					className: css`
						${mediaQueries.isSmall} {
							right: 10px !important;
							left: 10px !important;
							bottom: 10px !important;
							width: auto !important;
						}
					`
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
					isLoading={isCapturingEmail}
				/>
			</CornerDialog>
			<CornerDialog
				isShown={isLoading}
				hasClose={false}
				hasFooter={false}
				containerProps={{
					backgroundColor: colors.gray75,
					borderRadius: 100,
					zIndex: 6,
					paddingTop: 10,
					paddingRight: 20,
					paddingLeft: 20,
					paddingBottom: 20,
					width: 300,
					className: css`
						${mediaQueries.isSmall} {
							right: 10px !important;
							width: auto !important;
							max-width: 100vw;
						}
					`
				}}
			>
				<Pane
					display="flex"
					alignItems="center"
					justifyContent="center"
					overflow="hidden"
				>
					<Spinner size={24} marginRight={10} />
					<Heading is="h4" size={600} fontWeight={900}>
						Loading your account...
					</Heading>
				</Pane>
			</CornerDialog>
			<ManageWalletsConnection />
			{/* <Script src="//marketing.usher.so/form/generate.js?id=1" /> */}
		</>
	);
};

export default DashboardContainer;
