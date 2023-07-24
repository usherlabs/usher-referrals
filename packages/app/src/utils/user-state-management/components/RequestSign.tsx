import { useAtomValue } from "jotai";
import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";
import {
	Button,
	CircleArrowRightIcon,
	CornerDialog,
	Pane,
	Text,
	toaster
} from "evergreen-ui";
import { useSignEthMessageAndConnect } from "@/components/connect/buttons/use-sign-eth-message";
import { USHER_SIGN_MESSAGE } from "@/components/connect/WalletConnect";
import { UNSUPPORTED_EVM_CHAIN } from "@/utils/get-chain-by-id";
import { utilStateAtoms } from "@/utils/user-state-management/atoms/util-states";

export const RequestSign = () => {
	const connectedToUnsignedAccount = useAtomValue(
		utilStateAtoms.connectedToUnsignedAccount
	);
	const primaryAccount = useAtomValue(onboardAtoms.primaryAccount);

	const { signAndConnect, loading } = useSignEthMessageAndConnect();
	const connectedToUnsupportedChains = useAtomValue(
		utilStateAtoms.connectedToUnsupportedChains
	);

	const handleSign = async () => {
		if (connectedToUnsignedAccount) {
			const { chain } = primaryAccount;
			if (chain !== UNSUPPORTED_EVM_CHAIN) {
				await signAndConnect({
					provider: primaryAccount.provider,
					signingMessage: USHER_SIGN_MESSAGE,
					address: primaryAccount.address,
					chain,
					connection: primaryAccount.connection
				});
			} else {
				toaster.warning(
					"Unsupported network. Please switch to a supported chain before proceeding"
				);
			}
		}
	};
	return (
		<CornerDialog
			title={"Sign to continue"}
			// first should handle unsupported chains on other component
			isShown={connectedToUnsignedAccount && !connectedToUnsupportedChains}
			hasFooter={false}
			hasClose={false}
		>
			<Pane display={"flex"} flexDirection={"column"}>
				<Text>The wallet you are currently connected is not signed yet.</Text>
				<Button
					iconAfter={<CircleArrowRightIcon />}
					marginTop={8}
					intent="primary"
					appearance="primary"
					alignSelf={"flex-end"}
					isLoading={loading}
					onClick={handleSign}
				>
					Sign
				</Button>
			</Pane>
		</CornerDialog>
	);
};
