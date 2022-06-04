import React, { useState, useCallback } from "react";
import {
	Paragraph,
	Button,
	Strong,
	majorScale,
	Pane,
	Dialog,
	useTheme,
	LockIcon,
	ButtonProps
} from "evergreen-ui";

export type Props = {
	onClaim: (() => Promise<void>) | (() => void);
	buttonProps?: ButtonProps;
};

const ClaimButton: React.FC<Props> = ({ onClaim, buttonProps }) => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);

	const onStart = useCallback(() => {
		// ...
	}, []);

	return (
		<>
			<Button
				height={majorScale(6)}
				intent="success"
				appearance="primary"
				iconBefore={LockIcon}
				minWidth={260}
				width="100%"
				{...buttonProps}
				onClick={() => setShowDialog(true)}
			>
				<Strong color="inherit" fontSize="1.1em">
					Claim Rewards
				</Strong>
			</Button>
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
					{/* <UilDna size="80" color={colors.blue500} /> */}
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
					{/* <UilHardHat size="80" color={colors.orange500} /> */}
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

export default ClaimButton;
