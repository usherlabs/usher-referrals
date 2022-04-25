import React from "react";
import { Pane, Label, Spinner } from "evergreen-ui";
import PropTypes from "prop-types";

const Preloader = ({ message, ...props }) => (
	<Pane
		height="100%"
		width="100%"
		flex={1}
		display="flex"
		alignItems="center"
		justifyContent="center"
		position="fixed"
		left="0"
		right="0"
		bottom="0"
		top="0"
		background="tint1"
		zIndex={99}
		flexDirection="column"
		{...props}
	>
		<Spinner size={38} />
		{message && (
			<Pane marginTop={24}>
				<Label>{message}</Label>
			</Pane>
		)}
	</Pane>
);

Preloader.propTypes = {
	message: PropTypes.string
};

Preloader.defaultProps = {
	message: ""
};

export default Preloader;
