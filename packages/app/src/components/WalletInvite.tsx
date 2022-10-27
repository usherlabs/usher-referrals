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
import { useArConnect } from "@/hooks";
import { Chains } from "@/types";
import { onboard } from "@/utils/onboard";
import { ethers } from "ethers";
import { Heading, Pane, Strong, Text, toaster } from "evergreen-ui";
import { useCallback, useState } from "react";
import { browserName } from "react-device-detect";
import * as uint8arrays from "uint8arrays";
import { WalletConnectButton } from "./WalletConnectButton";

type Props = {
	domain: string;
	chain: Chains;
	onConnect: (address: string, signature: string) => Promise<boolean>;
};

const WalletInvite = ({ domain, chain, onConnect }: Props) => {
	const [getArConnect] = useArConnect();

	const [isConnecting, setConnecting] = useState(false);

	const connectArConnect = useCallback(async () => {
		const arconnect = await getArConnect();
		if (arconnect) {
			setConnecting(true);
			// connect(Connections.ARCONNECT)
			// 	.then(() => {
			// 		onConnect(Connections.ARCONNECT); // used to close the sidesheet.
			// 	})
			// 	.finally(() => {
			// 		setConnecting(false);
			// 	});
		} else {
			const openLink = browserName.toLowerCase().includes("firefox")
				? ARCONNECT_FIREFOX_URL
				: ARCONNECT_CHROME_URL;
			window.open(openLink);
		}
	}, [browserName]);

	const connectWallet = useCallback(async (onboardWalletLabel: string) => {
		setConnecting(true);

		try {
			const [walletState] = await onboard.connectWallet({
				autoSelect: { disableModals: true, label: onboardWalletLabel }
			});
			const [account] = walletState.accounts;
			const provider = new ethers.providers.Web3Provider(walletState.provider);
			const signer = provider.getSigner();

			const message = `Please connect your wallet to continue to ${domain}`;
			const signedMessage = await signer
				.signMessage(uint8arrays.fromString(message))
				.catch(() => {
					throw new Error("Sign the message with your wallet to continue");
				});

			// TODO: Investigate if `toLowerCase()` is really needed here
			onConnect(account.address.toLowerCase(), signedMessage);
		} catch (e) {
			toaster.danger(e instanceof Error ? e.message : String(e));
		} finally {
			setConnecting(false);
		}
	}, []);

	const connectMetaMask = useCallback(async () => {
		setConnecting(true);
		try {
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
				await connectWallet("MetaMask");
			}
		} catch (e) {
			toaster.danger(e instanceof Error ? e.message : String(e));
		} finally {
			setConnecting(false);
		}
	}, [browserName]);

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
						isConnecting={isConnecting}
						onClick={connectArConnect}
					/>
				)}
				{chain === Chains.ETHEREUM && (
					<Pane display="flex" flexDirection="column">
						<WalletConnectButton
							text="MetaMask"
							icon={MetaMaskIcon}
							isConnecting={isConnecting}
							onClick={connectMetaMask}
						/>
						<WalletConnectButton
							text="WalletConnect"
							icon={WalletConnectIcon}
							isConnecting={isConnecting}
							onClick={() => connectWallet("WalletConnect")}
						/>
						<WalletConnectButton
							text="CoinbaseWallet"
							icon={CoinbaseWalletIcon}
							isConnecting={isConnecting}
							onClick={() => connectWallet("Coinbase Wallet")}
						/>
					</Pane>
				)}
			</Pane>
		</Pane>
	);
};

export default WalletInvite;
