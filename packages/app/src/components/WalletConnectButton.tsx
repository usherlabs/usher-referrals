import {
	ARCONNECT_CHROME_URL,
	ARCONNECT_FIREFOX_URL,
	ETHEREUM_CHAIN_ID,
	METAMASK_CHROME_URL,
	METAMASK_FIREFOX_URL
} from "@/constants";
import { useArConnect } from "@/hooks";
import { Chains, Connections } from "@usher.so/shared";
import { getMagicClient } from "@/utils/magic-client";
import { ProviderLabel } from "@/utils/onboard";
import { WalletState } from "@web3-onboard/core";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { PermissionType } from "arconnect";
import { ethers } from "ethers";
import { Button, majorScale, Pane, toaster } from "evergreen-ui";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { browserName } from "react-device-detect";
import * as uint8arrays from "uint8arrays";
import {BrandLogomarkDark} from "@/brand/logo/BrandLogos";
import {brandName} from "@/brand/names";

type Props = {
	chain: Chains;
	connection: Connections;
	text: string;
	icon: JSX.Element | any;
	providerLabel: ProviderLabel;
	signingMessage: string;
	isConnecting?: boolean;
	onConnect: (
		chain: Chains,
		address: string,
		connection: Connections,
		signature: string
	) => Promise<void>;
};

export const WalletConnectButton = ({
	chain,
	connection,
	text,
	icon,
	providerLabel,
	signingMessage,
	isConnecting,
	onConnect
}: Props) => {
	const [arweaveWallet, setArweaveWallet] = useState<string>();
	const [ethWallet, setEthWallet] = useState<WalletState>();
	const [waitingForChain, setWaitingForChain] = useState(false);
	const [signing, setSigning] = useState(false);
	const [signedMessage, setSignedMessage] = useState<string>();
	const [{ connecting }, connect] = useConnectWallet();
	const wallets = useWallets();
	const [
		{ connectedChain: connectedEthChain, settingChain: settingEthChain },
		setChain
	] = useSetChain(providerLabel);
	const [arConnect] = useArConnect();
	const isLoading = useMemo(
		() =>
			isConnecting ||
			connecting ||
			waitingForChain ||
			settingEthChain ||
			signing,
		[connecting, waitingForChain, settingEthChain, signing]
	);

	const internalIcon = useMemo(() => {
		if (React.isValidElement(icon)) {
			return icon;
		}
		return <Image src={icon} width={30} height={30} />;
	}, [icon]);

	const checkWalletInstalled = useCallback(async () => {
		if (providerLabel === ProviderLabel.ArConnect) {
			if (!arConnect) {
				const openLink = browserName.toLowerCase().includes("firefox")
					? ARCONNECT_FIREFOX_URL
					: ARCONNECT_CHROME_URL;
				window.open(openLink);

				toaster.danger(
					"Please install ArConnect and reload the page to continue"
				);
				return false;
			}
		}

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
	}, [providerLabel, arConnect]);

	const connectWallet = useCallback(async () => {
		try {
			if (!checkWalletInstalled()) {
				return;
			}

			if (providerLabel === ProviderLabel.ArConnect && arConnect) {
				const permissions: PermissionType[] = ["ACCESS_ADDRESS", "SIGNATURE"];
				await arConnect.connect(permissions, {
					name: brandName.titleCase,
					logo: BrandLogomarkDark
				});
				// await delay(1000);
				const arweaveAddress = await arConnect.getActiveAddress();
				if (!arweaveAddress) {
					throw new Error();
				}
				setArweaveWallet(arweaveAddress);
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

			const [walletState] = await connect({
				autoSelect: { disableModals: true, label: providerLabel }
			});
			if (!walletState) {
				throw new Error();
			}
			setEthWallet(walletState);
		} catch {
			toaster.danger("Connect your wallet to continue");
		}
	}, [checkWalletInstalled]);

	const switchChain = useCallback(async () => {
		setWaitingForChain(true);
		setTimeout(async () => {
			try {
				const success = await setChain({ chainId: ETHEREUM_CHAIN_ID });
				if (!success) {
					const [walletState] = wallets.filter(
						(w) => w.label === providerLabel
					);

					if (walletState?.chains[0].id !== ETHEREUM_CHAIN_ID) {
						console.log("network NOT changed");
						throw new Error();
					}
				}
			} catch {
				setEthWallet(undefined);
				toaster.danger("Switch the network in your wallet to continue");
			} finally {
				setWaitingForChain(false);
			}
		}, 1000);
	}, []);

	const signMessage = useCallback(async () => {
		try {
			setSigning(true);

			if (providerLabel === ProviderLabel.ArConnect && arConnect) {
				const authId = [Chains.ARWEAVE, arweaveWallet].join(":");
				const sig = await arConnect.signature(uint8arrays.fromString(authId), {
					name: "RSA-PSS",
					saltLength: 0 // This ensures that no additional salt is produced and added to the message signed.
				});
				const signature = uint8arrays.toString(sig);

				setSignedMessage(signature);
				return;
			}

			if (providerLabel !== ProviderLabel.ArConnect) {
				if (!ethWallet || !signingMessage) {
					return;
				}
				const provider = new ethers.providers.Web3Provider(ethWallet.provider);
				const signer = provider.getSigner();
				const sig = await signer.signMessage(
					uint8arrays.fromString(signingMessage)
				);
				setSignedMessage(sig);
			}
		} catch {
			setEthWallet(undefined);
			toaster.danger("Sign the message with your wallet to continue");
		} finally {
			setSigning(false);
		}
	}, [arweaveWallet, ethWallet, arConnect]);

	useEffect(() => {
		(async () => {
			if (isLoading) {
				return;
			}

			if (providerLabel === ProviderLabel.ArConnect) {
				if (!arweaveWallet) {
					return;
				}

				if (!signedMessage) {
					await signMessage();
				} else {
					await onConnect(chain, arweaveWallet, connection, signedMessage);
				}
			} else {
				if (!connectedEthChain || !ethWallet) {
					return;
				}

				if (connectedEthChain.id !== ETHEREUM_CHAIN_ID) {
					await switchChain();
					return;
				}

				if (!signedMessage) {
					await signMessage();
				} else {
					// TODO: Investigate if `toLowerCase()` is really needed here
					const [account] = ethWallet.accounts;
					await onConnect(
						chain,
						account.address.toLowerCase(),
						connection,
						signedMessage
					);
				}
			}
		})();
	}, [isLoading, connectedEthChain, ethWallet, signedMessage, signMessage]);

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
