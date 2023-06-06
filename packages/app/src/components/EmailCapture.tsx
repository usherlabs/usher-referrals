import React from "react";
import {
	Button,
	Heading,
	majorScale,
	Pane,
	PaneProps,
	Text
} from "evergreen-ui";

import EmailSubmit from "@/components/EmailSubmit";

/**
 * Screen for connecting an Email for communication.
 */

export type Props = {
	onDismiss?: (() => void) | (() => Promise<void>);
	onSubmit: ((value: string) => void) | ((value: string) => Promise<void>);
	hasHeading?: boolean;
	hasSkip?: boolean;
	inputContainerProps?: PaneProps;
	isLoading?: boolean;
};

const EmailCaptureScreen: React.FC<Props> = ({
	hasHeading = true,
	hasSkip = true,
	onDismiss,
	onSubmit,
	inputContainerProps,
	isLoading = false
}) => {
	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
		>
			{hasHeading && (
				<Heading is="h1" size={800} marginBottom={12}>
					🔔&nbsp;&nbsp;Let&apos;s keep in touch
				</Heading>
			)}
			<Text size={500}>
				Get notified when your rewards are delivered, when new campaigns are
				live and more.
			</Text>
			<Pane
				background="tint2"
				padding={16}
				margin={12}
				borderRadius={8}
				{...inputContainerProps}
			>
				<EmailSubmit onSubmit={onSubmit} loading={isLoading} />
			</Pane>
			{hasSkip && (
				<Button
					height={majorScale(5)}
					minWidth={260}
					appearance="minimal"
					onClick={onDismiss}
				>
					<strong>Skip this step</strong>
				</Button>
			)}
		</Pane>
	);
};

export default EmailCaptureScreen;
