import { Pane, Heading, Text } from "evergreen-ui";

const LinkError = () => {
	return (
		<Pane
			display="flex"
			flexDirection="column"
			padding={16}
			maxWidth={1280}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
			alignItems="center"
			justifyContent="center"
		>
			<Pane textAlign="center">
				<Heading size={800} marginBottom={10}>
					Oops! There seems to have been an error
				</Heading>
				<Text size={600}>Please contact your Usher for more information.</Text>
			</Pane>
		</Pane>
	);
};

export default LinkError;
