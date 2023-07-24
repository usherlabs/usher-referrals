import React from "react";
import { WalletState } from "@web3-onboard/core";
import { ethers } from "ethers";
import { toaster } from "evergreen-ui";
import * as uint8arrays from "uint8arrays";
import { useUser } from "@/hooks";
import { StoredWallet, storedWallets } from "@/utils/wallets/stored-wallets";
import { Chains, Connections } from "@usher.so/shared";

export const useSignEthMessage = () => {
	const [signing, setSigning] = React.useState(false);

	const signMessage = React.useCallback(
		async ({
			ethWallet,
			signingMessage
		}: {
			ethWallet: Pick<WalletState, "provider">;
			signingMessage: string;
		}) => {
			try {
				setSigning(true);

				const provider = new ethers.providers.Web3Provider(ethWallet.provider);
				const signer = provider.getSigner();
				const sig = await signer.signMessage(
					uint8arrays.fromString(signingMessage)
				);
				return sig;
			} catch (e) {
				toaster.danger("Sign the message with your wallet to continue");
				throw e;
			} finally {
				setSigning(false);
			}
		},
		[]
	);

	return {
		signMessage,
		signing
	};
};

export const useSignEthMessageAndConnect = () => {
	const { signMessage, signing } = useSignEthMessage();
	const [connecting, setConnecting] = React.useState(false);

	const loading = React.useMemo(
		() => connecting || signing,
		[signing, connecting]
	);

	const {
		actions: { connect }
	} = useUser();

	const signAndConnect = React.useCallback(
		async ({
			provider,
			chain,
			connection,
			signingMessage,
			address
		}: {
			provider: WalletState["provider"];
			signingMessage: string;
			chain: Chains;
			connection: Connections;
			address: string;
		}) => {
			const sig = await signMessage({
				ethWallet: { provider },
				signingMessage
			});

			const wallet: StoredWallet = {
				chain,
				connection,
				address,
				signature: sig
			};
			storedWallets.add(wallet);

			setConnecting(true);
			connect(wallet).finally(() => {
				setConnecting(false);
			});
		},
		[connect, signMessage]
	);
	return {
		signAndConnect,
		loading
	};
};
