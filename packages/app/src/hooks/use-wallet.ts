import { useContext } from "react";

import { WalletContext } from "@/providers/Wallet";

function useWallet() {
	const {
		wallet,
		loading,
		isArConnectLoaded,
		removeWallet,
		getWallet,
		setWallet
	} = useContext(WalletContext);

	return {
		wallet,
		isLoading: loading,
		isArConnectLoaded,
		actions: {
			removeWallet,
			getWallet,
			setWallet
		}
	};
}

export default useWallet;
