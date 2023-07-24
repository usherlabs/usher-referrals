import { METAMASK_CHROME_URL, METAMASK_FIREFOX_URL } from "@/constants";
import { Connections } from "@usher.so/shared";
import { ProviderLabel } from "@/utils/onboard";
import { useConnectWallet } from "@web3-onboard/react";
import { Button, majorScale, Pane, toaster } from "evergreen-ui";
import Image from "next/image";
import React, { useCallback, useMemo } from "react";
import { browserName } from "react-device-detect";
import { getMagicClient } from "@/utils/magic-client";
import { getChainById, isSupportedChain } from "@/utils/get-chain-by-id";
import { useSignEthMessage } from "@/components/connect/buttons/use-sign-eth-message";
import { WalletConnectButtonProps } from "@/components/connect/buttons/types";

export type EthWalletConnectButtonProps = WalletConnectButtonProps<
	Exclude<Connections, Connections.ARCONNECT>
>;

export const EthWalletConnectButton = ({
	connection,
	text,
	icon,
	providerLabel,
	signingMessage,
	isConnecting,
	onConnect
}: EthWalletConnectButtonProps) => {
	const [{ connecting, wallet: lastWallet }, connect] = useConnectWallet();
	const { signMessage, signing } = useSignEthMessage();

	const isLoading = useMemo(
		() => isConnecting || connecting || signing,
		[connecting, isConnecting, signing]
	);

	const internalIcon = useMemo(() => {
		if (React.isValidElement(icon)) {
			return icon;
		}
		return <Image src={icon} width={30} height={30} />;
	}, [icon]);

	const checkWalletInstalled = useCallback(async () => {
		if (
			providerLabel === ProviderLabel.MetaMask &&
			(!window.ethereum ||
				!window.ethereum.isMetaMask ||
				window.ethereum.isBraveWallet)
		) {
			const openLink = browserName.toLowerCase().includes("firefox")
				? METAMASK_FIREFOX_URL
				: METAMASK_CHROME_URL;
			window.open(openLink);

			toaster.danger("Please install MetaMask and reload the page to continue");
			return false;
		}

		return true;
	}, [providerLabel]);

	const connectWallet = useCallback(async () => {
		try {
			if (!checkWalletInstalled()) {
				return;
			}

			if (providerLabel === ProviderLabel.Magic) {
				const { magic } = getMagicClient();
				const isLoggedIn = await magic.user.isLoggedIn();
				if (!isLoggedIn) {
					// Redirect to magic login page
					window.location.href = "/magic/login"; //* Important to use window.location.href for a full page reload.
				}
				return;
			}
			const [newWallet] = await connect({
				autoSelect: { disableModals: true, label: providerLabel }
			});

			if (!newWallet || newWallet === lastWallet) {
				// nothing changed, probably it was dismissed, we may return
				return;
			}

			const {
				chains: [recentlyConnectedChain],
				accounts: [account]
			} = newWallet;

			const chain = getChainById(recentlyConnectedChain.id);

			if (!isSupportedChain(chain)) {
				return;
			}

			if (!account) {
				toaster.danger("Please connect to an account on your wallet");
			}

			const signedMessage = await signMessage({
				ethWallet: newWallet,
				signingMessage
			});
			await onConnect({
				connectedAddress: account.address,
				connection,
				connectedChain: chain,
				signature: signedMessage
			});
		} catch (e) {
			console.error(e);
			toaster.danger("Connect your wallet to continue");
		}
	}, [
		checkWalletInstalled,
		connect,
		connection,
		lastWallet,
		onConnect,
		providerLabel,
		signMessage,
		signingMessage
	]);

	return (
		<Pane marginBottom={8}>
			<Button
				height={majorScale(7)}
				iconBefore={internalIcon}
				onClick={connectWallet}
				isLoading={isLoading}
				minWidth={300}
			>
				<strong>{text}</strong>
			</Button>
		</Pane>
	);
};
