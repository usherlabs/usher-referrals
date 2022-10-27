import ArConnectIcon from "@/assets/icon/arconnect.svg";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import {
	ARCONNECT_CHROME_URL,
	ARCONNECT_FIREFOX_URL,
	METAMASK_CHROME_URL,
	METAMASK_FIREFOX_URL
} from "@/constants";
import { useUser } from "@/hooks/";
import { Connections } from "@/types";
import { UilLockOpenAlt } from "@iconscout/react-unicons";
import { Pane } from "evergreen-ui";
import React, { useCallback, useState } from "react";
import { browserName } from "react-device-detect";
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

	const connectWallet = useCallback(async (connection: Connections) => {
		setConnecting(true);
		connect(connection)
			.then(() => {
				onConnect(connection); // used to close the sidesheet.
			})
			.finally(() => {
				setConnecting(false);
			});
	}, []);

	const connectArConnect = useCallback(async () => {
		if (!window.arweaveWallet) {
			const openLink = browserName.toLowerCase().includes("firefox")
				? ARCONNECT_FIREFOX_URL
				: ARCONNECT_CHROME_URL;
			window.open(openLink);
		} else {
			await connectWallet(Connections.ARCONNECT);
		}
	}, [browserName]);

	const connectMetaMask = useCallback(async () => {
		if (
			!window.ethereum ||
			!window.ethereum.isMetaMask ||
			window.ethereum.isBraveWallet
		) {
			const openLink = browserName.toLowerCase().includes("firefox")
				? METAMASK_FIREFOX_URL
				: METAMASK_CHROME_URL;
			window.open(openLink);
		} else {
			await connectWallet(Connections.METAMASK);
		}
	}, [browserName]);

	return (
		<Pane display="flex" flexDirection="column">
			{!hide.includes(Connections.ARCONNECT) && (
				<WalletConnectButton
					text="ArConnect"
					icon={ArConnectIcon}
					isConnecting={isLoading}
					onClick={connectArConnect}
				/>
			)}
			{!hide.includes(Connections.METAMASK) && (
				<WalletConnectButton
					text="MetaMask"
					icon={MetaMaskIcon}
					isConnecting={isConnecting}
					onClick={connectMetaMask}
				/>
			)}
			{!hide.includes(Connections.WALLETCONNECT) && (
				<WalletConnectButton
					text="WalletConnect"
					icon={WalletConnectIcon}
					isConnecting={isConnecting}
					onClick={() => connectWallet(Connections.WALLETCONNECT)}
				/>
			)}
			{!hide.includes(Connections.COINBASEWALLET) && (
				<WalletConnectButton
					text="CoinbaseWallet"
					icon={CoinbaseWalletIcon}
					isConnecting={isConnecting}
					onClick={() => connectWallet(Connections.COINBASEWALLET)}
				/>
			)}
			{!hide.includes(Connections.MAGIC) && (
				<WalletConnectButton
					text="Email, SMS, and more"
					icon={<UilLockOpenAlt size="28" />}
					isConnecting={isConnecting}
					onClick={() => connectWallet(Connections.MAGIC)}
				/>
			)}
		</Pane>
	);
};

WalletConnect.defaultProps = {
	hide: []
};

export default WalletConnect;
