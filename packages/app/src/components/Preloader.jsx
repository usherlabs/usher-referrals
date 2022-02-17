import React from "react";
import { Pane, Spinner } from "evergreen-ui";

const Preloader = (props) => (
	<Pane
		height="100%"
		width="100%"
		flex={1}
		display="flex"
		alignItems="center"
		justifyContent="center"
		position="absolute"
		left="0"
		right="0"
		bottom="0"
		top="0"
		background="tint1"
		zIndex={99}
		{...props}
	>
		<Spinner size={38} />
	</Pane>
);

export default Preloader;
