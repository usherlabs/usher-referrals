import {
	Button,
	Heading,
	ListItem,
	majorScale,
	Pane,
	Paragraph,
	Strong,
	Text,
	UnorderedList
} from "evergreen-ui";
import { UilExclamationOctagon } from "@iconscout/react-unicons";
import { useRouter } from "next/router";
import Anchor from "@/components/Anchor";
import { useCustomTheme } from "@/brand/themes/theme";

const VerifyComplete = () => {
	const { colors } = useCustomTheme();
	const router = useRouter();
	const { redir } = router.query;

	return (
		<Pane
			display="flex"
			flexDirection="column"
			padding={16}
			maxWidth={600}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
			alignItems="flex-start"
			justifyContent="center"
		>
			<Pane
				display="flex"
				alignItems="flex-start"
				width={100}
				marginBottom={24}
			>
				<UilExclamationOctagon size="80" color={colors.red500} />
			</Pane>
			<Heading size={800} marginBottom={10} textAlign="left">
				Your verification failed!
			</Heading>
			<Paragraph size={600} textAlign="left">
				Please consider:
			</Paragraph>
			<UnorderedList marginBottom={12}>
				<ListItem fontSize="1em">
					<Paragraph size={600} textAlign="left">
						Ensure you are authenticated when starting your verification
					</Paragraph>
				</ListItem>
				<ListItem fontSize="1em">
					<Paragraph size={600} textAlign="left">
						If have already verified your personhood, you cannot verify again
						for a new account.
						<br />
						<Strong fontSize="inherit">
							To link your accounts, connect your wallets from both accounts in
							a single session.
						</Strong>
					</Paragraph>
				</ListItem>
				<ListItem fontSize="1em">
					<Paragraph size={600} textAlign="left">
						You may not be the person verified for this account.
					</Paragraph>
				</ListItem>
			</UnorderedList>
			<Paragraph size={600} textAlign="center">
				If you think something is wrong, please contact the Support
			</Paragraph>
			<br />
			{redir ? (
				<Anchor href={redir as string}>
					<Button
						height={majorScale(7)}
						appearance="primary"
						minWidth={250}
						marginTop={24}
					>
						<Strong color="#fff" fontSize="1.1em">
							👉&nbsp;&nbsp;Back to main page
						</Strong>
					</Button>
				</Anchor>
			) : (
				<Text size={600} textAlign="center">
					Revist and refresh our page on your original device to continue.
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
