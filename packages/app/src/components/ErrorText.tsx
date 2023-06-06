import React from "react";
import { ErrorIcon, Pane, Text } from "evergreen-ui";

export type Props = {
	text: string;
	isSmall?: boolean;
};

const ErrorText: React.FC<Props> = ({ text, isSmall, ...props }) => {
	const wrapperProps = isSmall
		? {
				marginTop: 5
		  }
		: {
				marginTop: 10
		  };
	const iconProps = isSmall
		? {
				size: 14,
				marginRight: 5
		  }
		: {
				size: 18,
				marginTop: -2.5,
				marginRight: 14
		  };
	return (
		<Pane
			display="flex"
			flexDirection="row"
			alignItems="center"
			{...wrapperProps}
			{...props}
		>
			<ErrorIcon {...iconProps} />
			<Text flex={1} color="danger">
				{text}
			</Text>
		</Pane>
	);
};

ErrorText.defaultProps = {
	isSmall: false
};

export default ErrorText;
