import React, { useCallback } from "react";
import { Pane, Heading, Text, Button, majorScale } from "evergreen-ui";

import { useUser } from "@/hooks/";
import EmailSubmit from "@/components/EmailSubmit";

/**
 * Screen for connecting an Email for communication.
 */

export type Props = {
	onSkip?: (() => void) | (() => Promise<void>);
	onCapture: ((value: string) => void) | ((value: string) => Promise<void>);
};

const EmailCaptureScreen: React.FC<Props> = ({ onSkip, onCapture }) => {
	const { isLoading } = useUser();

	const onSubmit = useCallback(async (value: string) => {
		// TODO: Add encrypted email to the DID
		console.log(value);
		// const { success } = await connect(Connections.MAGIC);
		// setTimeout(() => {
		// 	setDisabled(false);
		// }, 5000);
		// if (!success) {
		// 	alerts.error();
		// 	return;
		// }
		// toaster.success(
		// 	"An email with a Magic Link has been sent to you. Click the link in the email to Sign In.",
		// 	{ duration: 10 }
		// );
		onCapture(value);
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				🔔&nbsp;&nbsp;Let&apos;s keep in touch
			</Heading>
			<Text size={500}>
				Get notified when rewards are confirmed, and on other important updates
				to Usher.
			</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<EmailSubmit onSubmit={onSubmit} loading={isLoading} />
			</Pane>
			<Button
				height={majorScale(5)}
				minWidth={260}
				appearance="minimal"
				onClick={onSkip}
			>
				<strong>Skip this step</strong>
			</Button>
		</Pane>
	);
};

export default EmailCaptureScreen;
