import {
	Pane,
	Heading,
	Text,
	useTheme,
	Button,
	majorScale,
	Strong
} from "evergreen-ui";
import { UilDna } from "@iconscout/react-unicons";
import { useRouter } from "next/router";
import Anchor from "@/components/Anchor";

const VerifyComplete = () => {
	const { colors } = useTheme();
	const router = useRouter();
	const { redir } = router.query;

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
			<Pane display="flex" alignItems="center" width={100} marginBottom={24}>
				<UilDna size="100" color={colors.blue500} />
			</Pane>
			<Heading size={800} marginBottom={10}>
				Your account has been verified!
			</Heading>
			{redir ? (
				<Anchor href={redir as string}>
					<Button
						height={majorScale(7)}
						appearance="primary"
						minWidth={250}
						marginTop={24}
					>
						<Strong color="#fff" fontSize="1.1em">
							👉&nbsp;&nbsp;Back to Usher
						</Strong>
					</Button>
				</Anchor>
			) : (
				<Text size={600}>
					Revist and refresh Usher on your original device to continue.
				</Text>
			)}
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

export default VerifyComplete;
