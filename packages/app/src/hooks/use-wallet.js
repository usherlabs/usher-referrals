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

	return [
		wallet,
		loading,
		isArConnectLoaded,
		{
			removeWallet,
			getWallet,
			setWallet
		}
	];
}

export default useWallet;
