import { Heading, Pane, Strong, Text } from "evergreen-ui";
import { useCallback, useMemo } from "react";

import ArConnectIcon from "@/assets/icon/arconnect.svg";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import { ProviderLabel } from "@/utils/onboard";
import { Chains, Connections } from "@usher.so/shared";
import { WalletConnectButton } from "./connect/buttons/WalletConnectButton";

export type WalletInviteProps = {
	domain: string;
	chain?: Chains;
	connections?: Connections[];
	onConnect: (input: {
		connectedChain: Chains;
		connectedAddress: string;
		connection: Connections;
		signature: string;
	}) => Promise<void>;
};

/**
 * Shows list of buttons to connect a wallet
 * @param domain destination domain to show in the prompt
 * @param chain if specified, shows all the wallets applicable to the Chain
 * @param connections if specified, shows the list of the wallets no mattar the Chain
 * @callback onConnect fires when a button clicked
 */
const WalletInvite = ({
	domain,
	chain,
	connections,
	onConnect
}: WalletInviteProps) => {
	const signingMessage = useMemo(
		() => `Please connect your wallet to continue to ${domain}`,
		[domain]
	);

	const isApplicable = useCallback(
		(buttonChain: Chains, buttonConnection: Connections) =>
			chain === buttonChain || connections?.includes(buttonConnection),
		[chain, connections]
	);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
			marginBottom={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				👋&nbsp;&nbsp;Welcome!
			</Heading>
			<Text size={500} textAlign="center">
				You've been invited.
			</Text>
			<Text size={500} textAlign="center">
				Please connect your wallet to continue to <Strong>{domain}</Strong>
			</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<Pane display="flex" flexDirection="column">
					{isApplicable(Chains.ARWEAVE, Connections.ARCONNECT) && (
						<WalletConnectButton
							connection={Connections.ARCONNECT}
							text="ArConnect"
							icon={ArConnectIcon}
							providerLabel={ProviderLabel.ArConnect}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
					)}
					{isApplicable(Chains.ETHEREUM, Connections.METAMASK) && (
						<WalletConnectButton
							connection={Connections.METAMASK}
							text="MetaMask"
							icon={MetaMaskIcon}
							providerLabel={ProviderLabel.MetaMask}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
					)}
					{isApplicable(Chains.ETHEREUM, Connections.WALLETCONNECT) && (
						<WalletConnectButton
							connection={Connections.WALLETCONNECT}
							text="WalletConnect"
							icon={WalletConnectIcon}
							providerLabel={ProviderLabel.WalletConnect}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
					)}
					{isApplicable(Chains.ETHEREUM, Connections.COINBASEWALLET) && (
						<WalletConnectButton
							connection={Connections.COINBASEWALLET}
							text="CoinbaseWallet"
							icon={CoinbaseWalletIcon}
							providerLabel={ProviderLabel.CoinbaseWallet}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
					)}
				</Pane>
			</Pane>
		</Pane>
	);
};

export default WalletInvite;
