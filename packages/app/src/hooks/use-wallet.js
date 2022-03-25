import isEmpty from "lodash/isEmpty";
import { useEffect, useContext } from "react";
import { useAuthStateChange, useSignIn } from "react-supabase";

import { identifyUser } from "@/utils/signals";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { WalletContext } from "@/providers/Wallet";
import saveWallet from "../actions/save-wallet";

function useWallet() {
	const {
		address,
		loading,
		isArConnectLoaded,
		removeAddress,
		getAddress,
		setAddress
	} = useContext(WalletContext);
	const [{ user }] = useSignIn();

	useAuthStateChange((event, session) => {
		switch (event) {
			case "SIGNED_IN": {
				// Set SignedIn User to State.
				const u = session.user;
				if (isEmpty(u)) {
					return;
				}
				if (u.role !== "authenticated") {
					return;
				}
				setErrorTrackingUser(u);
				identifyUser(u);
				break;
			}
			case "SIGNED_OUT": {
				window.location.reload();
				break;
			}
			default: {
				break;
			}
		}
	});

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
			removeAddress: removeAddress.finally(() => window.location.reload()),
			getAddress,
			setAddress
		}
	];
}

export default useWallet;
