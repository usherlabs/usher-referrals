import React, { useEffect, useState } from "react";
import { Pane, Heading } from "evergreen-ui";
import PropTypes from "prop-types";

import { MAX_SCREEN_WIDTH } from "@/constants";

const DashboardScreen = ({ makeAddress, connect }) => {
	// const [isLoading, setLoading] = useState(false);

	return (
		<Pane
			display="flex"
			alignItems="center"
			maxWidth={MAX_SCREEN_WIDTH}
			marginX="auto"
			padding={16}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				Let&apos;s get this 🥖
			</Heading>
		</Pane>
	);
};

DashboardScreen.propTypes = {
	makeAddress: PropTypes.func.isRequired,
	connect: PropTypes.func.isRequired
};

export default DashboardScreen;
