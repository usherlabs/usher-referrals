import {
	EVMConnections,
	providerLabelByConnection
} from "@/utils/provider-utils";
import { storedWallets } from "@/utils/wallets/stored-wallets";
import { onboard } from "@/utils/onboard";
import getArConnect from "@/utils/arconnect";
import { WalletState } from "@web3-onboard/core";

export const getUnauthenticatedWalletsForEVMConnection = async ({
	connection
}: {
	connection: EVMConnections;
}): Promise<WalletState[]> => {
	const onboardWalletLabel = providerLabelByConnection[connection];

	const hadPreviouslyConnectedWalletsForThisProvider = storedWallets
		.get()
		.some((w) => w.connection === connection);

	const walletIsFromSameProvider = (w: WalletState) =>
		w.label === onboardWalletLabel;

	const connectionWallets = onboard()
		.state.get()
		.wallets.filter(walletIsFromSameProvider);

	// if we couldn't find a wallet for this provider, but we know the user had previously connected wallets for
	// this provider, then we can assume that the user has disconnected their wallet from this provider,
	// and we should try to reconnect them.
	if (
		connectionWallets.length === 0 &&
		hadPreviouslyConnectedWalletsForThisProvider
	) {
		const newConnectionWallets = await onboard()
			.connectWallet({
				autoSelect: {
					label: onboardWalletLabel,
					disableModals: true
				}
			})
			// documentation says it will return the last connected state, which could be wallets from other providers
			// so we will filter it down to the last connected wallet for this provider
			.then((ws) => ws.filter(walletIsFromSameProvider));
		if (newConnectionWallets.length > 0) {
			return newConnectionWallets;
		}
	}
	return connectionWallets;
};
export const getUnauthenticatedAddressForArweave = async (): Promise<
	string | null
> => {
	const arConnect = await getArConnect();
	if (arConnect) {
		const arweaveWalletAddress = await arConnect
			.getActiveAddress()
			.catch((e) => console.trace(e));
		return arweaveWalletAddress ?? null;
	}
	return null;
};
