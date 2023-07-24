import { useAtomValue } from "jotai";
import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";
import { storedWallets } from "@/utils/wallets/stored-wallets";
import React from "react";

// TODO: remove when supporting multiple wallets
// Why?
// We need to remove localStorage wallets if we detect that a new wallet is connected
// for example, when the user goes to his wallet and changes manually the network or account
export const useConnectOnlyToLatestAccount = () => {
	const connectedAccounts = useAtomValue(onboardAtoms.connectedAccounts);
	const firstConnectedAccount = React.useMemo(
		() => connectedAccounts[0],
		[connectedAccounts]
	);

	React.useEffect(() => {
		const [storedWallet] = storedWallets.get();
		if (storedWallet && firstConnectedAccount) {
			const isADifferentAccount =
				firstConnectedAccount.address !== storedWallet.address ||
				firstConnectedAccount.chain !== storedWallet.chain ||
				firstConnectedAccount.connection !== storedWallet.connection;

			if (isADifferentAccount) {
				storedWallets.removeAll();
			}
		}
	}, [firstConnectedAccount]);
};
