import isEmpty from "lodash/isEmpty";
import { useEffect, useContext } from "react";

import { WalletContext } from "@/providers/Wallet";
import saveWallet from "@/actions/save-wallet";
import useUser from "./use-user";

function useWallet() {
	const {
		address,
		loading,
		isArConnectLoaded,
		removeAddress,
		getAddress,
		setAddress
	} = useContext(WalletContext);
	const [user] = useUser();

	useEffect(() => {
		if (!isEmpty(address) && !isEmpty(user)) {
			saveWallet(user, address);
		}
	}, [address, user]);

	useEffect(() => {
		// If user already fetched -- ie fetched from SSR
		if (!loading && !isEmpty(address)) {
			return () => {};
		}

		// Check first if ArConnect has loaded.
		if (isArConnectLoaded) {
			// Check if address exists if it does not already exist
			getAddress();
		}

		return () => {};
	}, [isArConnectLoaded]);

	return [
		address,
		loading,
		isArConnectLoaded,
		{
			removeAddress,
			getAddress,
			setAddress
		}
	];
}

export default useWallet;
