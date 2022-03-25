import isEmpty from "lodash/isEmpty";
import { useEffect, useContext } from "react";

import { WalletContext } from "@/providers/Wallet";
// import { supabase } from "@/utils/supabase-client";
// import events from "@/utils/events";

function useWallet() {
	const {
		address,
		loading,
		isArConnectLoaded,
		removeAddress,
		getAddress,
		setAddress
	} = useContext(WalletContext);

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
		{ removeAddress, getAddress, setAddress }
	];
}

export default useWallet;
