import React from "react";
import { Button, Heading, majorScale, Pane, Strong } from "evergreen-ui";

import Anchor from "@/components/Anchor";
import { MAX_SCREEN_WIDTH } from "@/constants";
import { useCustomTheme } from "@/brand/themes/theme";

const Serve404 = () => {
	const { colors } = useCustomTheme();

	return (
		<Pane
			display="flex"
			alignItems="center"
			flexDirection="column"
			maxWidth={MAX_SCREEN_WIDTH - 32}
			marginX="auto"
			width="100%"
			textAlign="center"
			paddingY={64}
			paddingX={32}
		>
			<Heading
				is="h1"
				size={900}
				width="100%"
				marginBottom={16}
				textAlign="center"
			>
				This page cannot be found!
			</Heading>
			<Heading
				is="h2"
				size={600}
				width="100%"
				color={colors.gray700}
				marginBottom={32}
				textAlign="center"
			>
				We&apos;ve searched, but alas, no result 😔.
				<br />
				On a good note, there are awesome campaigns for you explore.
			</Heading>
			<Anchor href="/explore">
				<Button height={majorScale(7)} appearance="primary" minWidth={300}>
					<Strong color="#fff" size={500}>
						Explore Campaigns
					</Strong>
				</Button>
			</Anchor>
		</Pane>
	);
};

export default Serve404;
