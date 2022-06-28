import React, { useCallback, useState } from "react";
import {
	Alert,
	Paragraph,
	Button,
	Strong,
	majorScale,
	Pane,
	Dialog,
	useTheme,
	toaster
} from "evergreen-ui";
import { isMobile } from "react-device-detect";
import { UilDna, UilSelfie, UilShieldCheck } from "@iconscout/react-unicons";
import CopyToClipboard from "react-copy-to-clipboard";
import { QRCodeSVG } from "qrcode.react";
import { isProd, ngrokUrl } from "@/env-config";
import { css } from "@linaria/core";

import Authenticate from "@/modules/auth";

const VerifyPersonhoodAlert = () => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [verifyUrl, setVerifyUrl] = useState("");
	// const verifyUrl = useRedir("/verify/start");

	const onStart = useCallback(async () => {
		setLoading(true);
		const authInstance = Authenticate.getInstance();
		const authToken = await authInstance.getAuthToken();
		let { origin } = window.location;
		if (!isProd && ngrokUrl) {
			origin = ngrokUrl;
		}
		let vUrl = `${origin}/verify/start?token=${authToken}`;
		if (isMobile) {
			vUrl += `&redir=${window.location.pathname + window.location.search}`;
			window.location.href = vUrl;
		} else {
			setVerifyUrl(vUrl);
			setLoading(false);
		}
	}, [isMobile, verifyUrl]);

	const onVerifyCopy = useCallback(async () => {
		toaster.notify("Copied!", {
			id: "copied"
		});
	}, []);

	return (
		<>
			<Alert
				intent="warning"
				title="Unlock Claims"
				className={css`
					h4 {
						font-size: 1em;
						margin: 1px 0 10px 0;
					}
					svg {
						height: 20px;
						width: 20px;
					}
				`}
			>
				<Paragraph marginBottom={12}>
					Verify your personhood to unlock the ability to submit claims.
				</Paragraph>
				<Button height={majorScale(4)} onClick={() => setShowDialog(true)}>
					<Strong>Verify your personhood</Strong>
				</Button>
			</Alert>
			<Dialog
				isShown={showDialog}
				title="🔐  Verify your personhood"
				onCloseComplete={() => {
					setVerifyUrl("");
					setShowDialog(false);
				}}
				hasFooter={false}
				containerProps={{
					paddingBottom: 40
				}}
			>
				{!verifyUrl && (
					<Pane>
						<Pane
							display="flex"
							alignItems="center"
							flexDirection="row"
							marginBottom={24}
						>
							<Pane display="flex" alignItems="center" width={50}>
								<UilShieldCheck size="50" color={colors.blue500} />
							</Pane>
							<Pane marginLeft={16}>
								<Paragraph size={500} marginY={0}>
									To protect our Advertisers from bad actors, partners are
									required to verify their personhood to claim rewards.
								</Paragraph>
							</Pane>
						</Pane>
						<Pane
							display="flex"
							alignItems="center"
							flexDirection="row"
							marginBottom={24}
						>
							<Pane display="flex" alignItems="center" width={50}>
								<UilDna size="50" color={colors.blue500} />
							</Pane>
							<Pane marginLeft={16}>
								<Paragraph size={500} marginY={0}>
									Verification requires biometric authentication. Biometric data
									will not leave your device. Models captured for verification
									are end-to-end encrypted.
								</Paragraph>
							</Pane>
						</Pane>
						<Pane
							display="flex"
							alignItems="center"
							justifyContent="center"
							marginTop={32}
						>
							<Button
								height={majorScale(7)}
								appearance="primary"
								onClick={onStart}
								minWidth={250}
								isLoading={isLoading}
							>
								<Strong color="#fff" fontSize="1.1em">
									👉&nbsp;&nbsp;Start Verification
								</Strong>
							</Button>
						</Pane>
					</Pane>
				)}
				{!isMobile && verifyUrl && (
					<Pane>
						<Pane
							display="flex"
							alignItems="center"
							flexDirection="row"
							marginBottom={24}
						>
							<Pane display="flex" alignItems="center" width={50}>
								<UilSelfie size="50" color={colors.blue500} />
							</Pane>
							<Pane marginLeft={8}>
								<Paragraph size={500} marginY={0}>
									To optimise your verification, open the following link on your
									Mobile Device
								</Paragraph>
							</Pane>
						</Pane>
						<Pane
							display="flex"
							alignItems="center"
							justifyContent="center"
							flexDirection="column"
							textAlign="center"
							marginTop={32}
						>
							<Pane marginBottom={12}>
								<QRCodeSVG value={verifyUrl} size={300} />
								<Paragraph>Scan the QR Code on your Mobile Device</Paragraph>
								<Paragraph>OR</Paragraph>
							</Pane>
							<CopyToClipboard text={verifyUrl} onCopy={onVerifyCopy}>
								<Button height={majorScale(5)} minWidth={250}>
									<Strong fontSize="1.1em">👉&nbsp;&nbsp;Copy Link</Strong>
								</Button>
							</CopyToClipboard>
							<Paragraph marginTop={24}>
								<Strong>
									Do not share this link with anyone. Biometrics of a
									non-authorised human will jeopardise access to your account
									&amp; funds.
								</Strong>
							</Paragraph>
						</Pane>
					</Pane>
				)}
			</Dialog>
		</>
	);
};

export default VerifyPersonhoodAlert;
