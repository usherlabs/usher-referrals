import React from "react";
import PropTypes from "prop-types";
import { Pane, Icon, Text } from "evergreen-ui";

const ErrorText = ({ text, isSmall, ...props }) => {
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
			<Icon icon="error" color="danger" title="Error" {...iconProps} />
			<Text flex={1} color="danger">
				{text}
			</Text>
		</Pane>
	);
};

ErrorText.propTypes = {
	text: PropTypes.string.isRequired,
	isSmall: PropTypes.bool
};

ErrorText.defaultProps = {
	isSmall: false
};

export default ErrorText;
