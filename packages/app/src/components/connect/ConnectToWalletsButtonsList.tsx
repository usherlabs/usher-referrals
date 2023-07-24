import ArConnectIcon from "@/assets/icon/arconnect.svg";
import { ProviderLabel } from "@/utils/onboard";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import { UilLockOpenAlt } from "@iconscout/react-unicons";
import { Connections } from "@usher.so/shared";
import type { WalletConnectProps } from "@/components/connect/WalletConnect";
import React from "react";
import { useUser } from "@/hooks";
import { WalletConnectButton } from "@/components/connect/buttons/WalletConnectButton";
import { storedWallets } from "@/utils/wallets/stored-wallets";
import { WalletConnectButtonProps } from "@/components/connect/buttons/types";

/**
 * Our intention is to show only wallets of a chain at a time.
 * Possible usage: for a selector shows what wallets can be clicked then connected for that chain
 */
export const ConnectToWalletsButtonsList = ({
	hide,
	signingMessage,
	isLoading: isPropLoading,
	onConnect
}: {
	hide: Connections[];
	signingMessage: string;
	isLoading: boolean;
	onConnect: NonNullable<WalletConnectProps["onConnect"]>;
}) => {
	const {
		isLoading: isUserLoading,
		actions: { connect }
	} = useUser();

	const [isConnecting, setConnecting] = React.useState(false);
	const isLoading = isUserLoading || isConnecting || isPropLoading;

	const connectWallet = React.useCallback<
		NonNullable<WalletConnectButtonProps["onConnect"]>
	>(
		async ({ connection, connectedAddress, signature, connectedChain }) => {
			const wallet = {
				connection,
				signature,
				address: connectedAddress,
				chain: connectedChain
			};
			storedWallets.add({ ...wallet });

			setConnecting(true);
			// todo: getting the first one for a quick fix, but should be revised when supporting multi-wallet
			connect(wallet)
				.then(() => {
					onConnect(connection); // used to close the sidesheet.
				})
				.finally(() => {
					setConnecting(false);
				});
		},
		[connect, onConnect]
	);

	const commonProps = {
		signingMessage,
		isConnecting: isLoading
	};
	return (
		<>
			{!hide.includes(Connections.ARCONNECT) && (
				<WalletConnectButton
					connection={Connections.ARCONNECT}
					text="ArConnect"
					icon={ArConnectIcon}
					providerLabel={ProviderLabel.ArConnect}
					onConnect={connectWallet}
					{...commonProps}
				/>
			)}
			{!hide.includes(Connections.METAMASK) && (
				<WalletConnectButton
					connection={Connections.METAMASK}
					text="MetaMask"
					icon={MetaMaskIcon}
					providerLabel={ProviderLabel.MetaMask}
					{...commonProps}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.WALLETCONNECT) && (
				<WalletConnectButton
					connection={Connections.WALLETCONNECT}
					text="WalletConnect"
					icon={WalletConnectIcon}
					providerLabel={ProviderLabel.WalletConnect}
					{...commonProps}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.COINBASEWALLET) && (
				<WalletConnectButton
					connection={Connections.COINBASEWALLET}
					text="CoinbaseWallet"
					icon={CoinbaseWalletIcon}
					providerLabel={ProviderLabel.CoinbaseWallet}
					{...commonProps}
					onConnect={connectWallet}
				/>
			)}
			{!hide.includes(Connections.MAGIC) && (
				<WalletConnectButton
					connection={Connections.MAGIC}
					text="Email, SMS, and more"
					icon={<UilLockOpenAlt size="28" />}
					providerLabel={ProviderLabel.Magic}
					{...commonProps}
					onConnect={connectWallet}
				/>
			)}
		</>
	);
};
