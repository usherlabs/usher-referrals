import React, { useCallback, useState } from "react";
import {
	Alert,
	Paragraph,
	Button,
	Strong,
	majorScale,
	Pane,
	Dialog,
	useTheme
} from "evergreen-ui";
import { UilDna, UilHardHat } from "@iconscout/react-unicons";

const VerifyPersonhoodAlert = () => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);

	const onStart = useCallback(() => {
		window.open("/verify/start");
	}, []);

	return (
		<>
			<Alert intent="warning" title="Unlock Claims">
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
				onCloseComplete={() => setShowDialog(false)}
				hasFooter={false}
				containerProps={{
					paddingBottom: 40
				}}
			>
				<Pane
					display="flex"
					alignItems="center"
					flexDirection="row"
					marginBottom={12}
				>
					<UilDna size="80" color={colors.blue500} />
					<Pane marginLeft={16}>
						<Paragraph size={500} marginY={0}>
							To protect our Advertisers from bad actors, we require partners to
							verify their personhood to claim their rewards.
						</Paragraph>
					</Pane>
				</Pane>
				<Pane
					display="flex"
					alignItems="center"
					flexDirection="row"
					marginBottom={12}
				>
					<UilHardHat size="80" color={colors.orange500} />
					<Pane marginLeft={16}>
						<Paragraph size={500} marginTop={0} marginBottom={8}>
							We are working to remove the requirement for document
							identification, but we are not quite there yet.
						</Paragraph>
						<Paragraph size={500} marginY={0}>
							As of now, we require you to undergo a KYC process to perform the
							verification.
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
					>
						<Strong color="#fff" fontSize="1.1em">
							👉&nbsp;&nbsp;Start Verification
						</Strong>
					</Button>
				</Pane>
			</Dialog>
		</>
	);
};

export default VerifyPersonhoodAlert;
