import { Heading, Pane, Text } from "evergreen-ui";
import Link from "next/link";

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
					Oops! You've been sent a bad link!
				</Heading>
				<Text size={600}>
					Need help? Reach out at{" "}
					<Link href="https://usher.so">
						<a>https://usher.so</a>
					</Link>
				</Text>
			</Pane>
		</Pane>
	);
};

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default LinkError;
