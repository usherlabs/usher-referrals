import React from "react";
import { useAtomValue } from "jotai";
import { onboardAtom } from "@/utils/onboard";
import { storedWalletsAtom } from "@/utils/wallets/stored-wallets";
import { providerLabelByConnection } from "@/utils/provider-utils";
import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";

export const useConnectToLastAccountOnPageLoad = () => {
	const onboard = useAtomValue(onboardAtom);
	const storedWallets = useAtomValue(storedWalletsAtom);
	const primaryAccount = useAtomValue(onboardAtoms.primaryAccount);
	React.useEffect(() => {
		// what is the situation for this?
		// a user recently loaded the application
		// so there may be stored wallets, and none of them are connected
		if (storedWallets[0] && !primaryAccount) {
			onboard.connectWallet({
				autoSelect: {
					label: providerLabelByConnection[storedWallets[0].connection],
					disableModals: true
				}
			});
		}
	}, [onboard, primaryAccount, storedWallets]);
};
