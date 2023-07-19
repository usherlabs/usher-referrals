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
import {WalletConnectButtonProps} from "@/components/connect/buttons/types";

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
	const [{ connecting }, connect] = useConnectWallet();
	const { signMessage, signing } = useSignEthMessage();

	const isLoading = useMemo(
		() => isConnecting || connecting || signing,
		[connecting, signing]
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
			const allWalletStates = await connect({
				autoSelect: { disableModals: true, label: providerLabel }
			});
			const walletStatesOfConnection = allWalletStates.filter(
				(walletState) => walletState.label === providerLabel
			);
			await Promise.all(
				walletStatesOfConnection.map(async (walletState) => {
					const signedMessage = await signMessage({
						ethWallet: walletState,
						signingMessage
					});
					const chains = walletState.chains.map((c) => getChainById(c.id));
					const addresses = walletState.accounts.map((a) => a.address);
					await onConnect({
						connectedAddresses: addresses,
						connection,
						connectedChains: chains.filter(isSupportedChain),
						signature: signedMessage
					});
				})
			);
		} catch (e) {
			console.error(e);
			toaster.danger("Connect your wallet to continue");
		}
	}, [checkWalletInstalled]);

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
