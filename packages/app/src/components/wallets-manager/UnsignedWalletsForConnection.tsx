import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";
import { ExtractAtomValue } from "jotai/vanilla/typeUtils";
import { css } from "@linaria/core";
import truncate from "@/utils/truncate";
import { Button, Label, Pane, toaster, Tooltip } from "evergreen-ui";
import CopyToClipboard from "react-copy-to-clipboard";
import { useCustomTheme } from "@/brand/themes/theme";
import { useSignEthMessageAndConnect } from "@/components/connect/buttons/use-sign-eth-message";
import { USHER_SIGN_MESSAGE } from "@/components/connect/WalletConnect";
import { UNSUPPORTED_EVM_CHAIN } from "@/utils/get-chain-by-id";

const onCopy = () => {
	toaster.notify("Address copied", {
		id: "wallet-side-sheet--address-copy"
	});
};

export const PendingSignupAddress = ({
	wallet
}: {
	wallet: ExtractAtomValue<
		typeof onboardAtoms.connectedUnsignedAccounts
	>[number];
}) => {
	return null; // while we don't support multi-account

	const { colors } = useCustomTheme();

	const { signAndConnect, loading: signLoading } =
		useSignEthMessageAndConnect();

	const handleSign = async () => {
		if (wallet.chain === UNSUPPORTED_EVM_CHAIN) {
			toaster.notify("Unsupported chain", {
				id: "wallet-side-sheet--unsupported-chain"
			});
			return;
		}
		await signAndConnect({
			provider: wallet.provider,
			chain: wallet.chain,
			connection: wallet.connection,
			signingMessage: USHER_SIGN_MESSAGE,
			address: wallet.address
		});
	};

	return (
		<Pane key={wallet.address}>
			<Pane
				display="flex"
				alignContent="center"
				flexDirection="row"
				justifyContent="space-between"
				padding={16}
			>
				<Pane
					display="flex"
					alignItems="center"
					justifyContent="center"
					flexDirection="row"
				>
					<Pane>
						<Tooltip content="Copy Address">
							<Pane>
								<CopyToClipboard text={wallet.address} onCopy={onCopy}>
									<Label
										color={colors.gray800}
										className={css`
											cursor: pointer;

											&:active {
												opacity: 0.8;
											}
										`}
									>
										{truncate(wallet.address, 6, 4)}
									</Label>
								</CopyToClipboard>
							</Pane>
						</Tooltip>
					</Pane>
				</Pane>
				<Pane display="flex" flexDirection="row" alignItems="center"></Pane>
			</Pane>
			<Pane>
				<Button onClick={handleSign} isLoading={signLoading}>
					Sign up
				</Button>
			</Pane>
		</Pane>
	);
};

export const UnsignedWalletsForConnection = ({
	wallets
}: {
	wallets: ExtractAtomValue<typeof onboardAtoms.connectedUnsignedAccounts>;
}) => {
	return (
		<div>
			{wallets.map((wallet) => (
				<PendingSignupAddress wallet={wallet} key={wallet.address} />
			))}
		</div>
	);
};
