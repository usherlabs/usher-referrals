import { UilLockOpenAlt } from "@iconscout/react-unicons";
import { Chains, Connections, Wallet } from "@usher.so/shared";
import React, { useCallback, useState } from "react";

import ArConnectIcon from "@/assets/icon/arconnect.svg";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import { useUser } from "@/hooks/";
import { ProviderLabel } from "@/utils/onboard";
import { Pane } from "evergreen-ui";
import { WalletConnectButton } from "./WalletConnectButton";

export type Props = {
	hide?: Connections[];
	onConnect?: (connection: string) => void;
	loading?: boolean;
};

const WalletConnect: React.FC<Props> = ({
	hide = [],
	onConnect = () => {},
	loading: isPropLoading = false
}) => {
	const {
		isLoading: isUserLoading,
		actions: { connect }
	} = useUser();

	const [isConnecting, setConnecting] = useState(false);
	const isLoading = isUserLoading || isConnecting || isPropLoading;

	const signingMessage =
		"To create your Usher account, please click the 'Sign' button.";

	const connectWallet = useCallback(
		async (
			chain: Chains,
			address: string,
			connection: Connections,
			signature: string
		) => {
			const wallet: Wallet & { signature: string } = {
				chain,
				connection,
				address,
				signature
			};

			// #region connectedWallets
			const previouslyConnectedWallets = JSON.parse(
				window.localStorage.getItem("connectedWallets") || "[]"
			) as (Wallet & { signature: string })[];
			previouslyConnectedWallets.push(wallet);
			window.localStorage.setItem(
				"connectedWallets",
				JSON.stringify(previouslyConnectedWallets)
			);
			// #endregion

			setConnecting(true);
			connect(connection)
				.then(() => {
					onConnect(connection); // used to close the sidesheet.
				})
				.finally(() => {
					setConnecting(false);
				});
		},
		[connect]
	);

	return (
		<Pane display="flex" flexDirection="column">
			{!hide.includes(Connections.ARCONNECT) && (
				<WalletConnectButton
					chain={Chains.ARWEAVE}
					connection={Connections.ARCONNECT}
					text="ArConnect"
					icon={ArConnectIcon}
					providerLabel={ProviderLabel.ArConnect}
					signingMessage={signingMessage}
					isConnecting={isLoading}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.METAMASK) && (
				<WalletConnectButton
					chain={Chains.ETHEREUM}
					connection={Connections.METAMASK}
					text="MetaMask"
					icon={MetaMaskIcon}
					providerLabel={ProviderLabel.MetaMask}
					signingMessage={signingMessage}
					isConnecting={isLoading}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.WALLETCONNECT) && (
				<WalletConnectButton
					chain={Chains.ETHEREUM}
					connection={Connections.WALLETCONNECT}
					text="WalletConnect"
					icon={WalletConnectIcon}
					providerLabel={ProviderLabel.WalletConnect}
					signingMessage={signingMessage}
					isConnecting={isLoading}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.COINBASEWALLET) && (
				<WalletConnectButton
					chain={Chains.ETHEREUM}
					connection={Connections.COINBASEWALLET}
					text="CoinbaseWallet"
					icon={CoinbaseWalletIcon}
					providerLabel={ProviderLabel.CoinbaseWallet}
					signingMessage={signingMessage}
					isConnecting={isLoading}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.MAGIC) && (
				<WalletConnectButton
					chain={Chains.ETHEREUM}
					connection={Connections.MAGIC}
					text="Email, SMS, and more"
					icon={<UilLockOpenAlt size="28" />}
					providerLabel={ProviderLabel.Magic}
					signingMessage={signingMessage}
					isConnecting={isLoading}
					onConnect={connectWallet}
				/>
			)}
		</Pane>
	);
};

WalletConnect.defaultProps = {
	hide: []
};

export default WalletConnect;
