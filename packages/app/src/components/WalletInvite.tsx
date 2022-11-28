import ArConnectIcon from "@/assets/icon/arconnect.svg";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import { Chains } from "@usher.so/shared";
import { ProviderLabel } from "@/utils/onboard";
import { Heading, Pane, Strong, Text } from "evergreen-ui";
import { useMemo } from "react";
import { WalletConnectButton } from "./WalletConnectButton";

type Props = {
	domain: string;
	chain: Chains;
	onConnect: (address: string, signature: string) => Promise<void>;
};

const WalletInvite = ({ domain, chain, onConnect }: Props) => {
	const signingMessage = useMemo(
		() => `Please connect your wallet to continue to ${domain}`,
		[domain]
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
				{chain === Chains.ARWEAVE && (
					<WalletConnectButton
						text="ArConnect"
						icon={ArConnectIcon}
						providerLabel={ProviderLabel.ArConnect}
						signingMessage={signingMessage}
						onConnect={onConnect}
					/>
				)}
				{chain === Chains.ETHEREUM && (
					<Pane display="flex" flexDirection="column">
						<WalletConnectButton
							text="MetaMask"
							icon={MetaMaskIcon}
							providerLabel={ProviderLabel.MetaMask}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
						<WalletConnectButton
							text="WalletConnect"
							icon={WalletConnectIcon}
							providerLabel={ProviderLabel.WalletConnect}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
						<WalletConnectButton
							text="CoinbaseWallet"
							icon={CoinbaseWalletIcon}
							providerLabel={ProviderLabel.CoinbaseWallet}
							signingMessage={signingMessage}
							onConnect={onConnect}
						/>
					</Pane>
				)}
			</Pane>
		</Pane>
	);
};

export default WalletInvite;
