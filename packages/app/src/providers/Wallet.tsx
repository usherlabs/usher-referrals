import React, {
	createContext,
	useState,
	useMemo,
	useCallback,
	useEffect
	// useContext
} from "react";
// import isEqual from "lodash/isEqual";
import useArConnect from "use-arconnect";
// import isEmpty from "lodash/isEmpty";
// import once from "lodash/once";

import {
	// User,
	Wallet,
	IWalletContext,
	Networks
} from "@/types";
import delay from "@/utils/delay";
// import handleException from "@/utils/handle-exception";
// import { saveWallet, getSkippedWallet } from "@/actions/wallet";
// import { saveInviteLink } from "@/actions/invite";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

// import { UserContext } from "./User";

type Props = {
	children: React.ReactNode;
};

const defaultWalletValues = {
	network: "",
	address: "",
	managed: false,
	active: false
};

export const WalletContext = createContext<IWalletContext>({
	wallet: defaultWalletValues,
	loading: false,
	isArConnectLoaded: false,
	setWallet() {},
	removeWallet() {},
	async getWallet() {
		return "";
	}
});

const WalletContextProvider: React.FC<Props> = ({ children }) => {
	const arconnect = useArConnect();
	const [wallet, setWalletState] = useState(defaultWalletValues);
	const [loading, setLoading] = useState(false);
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);

	const setWallet = useCallback(async (state: Wallet) => {
		setWalletState(state);
	}, []);

	const removeWallet = useCallback(async () => {
		if (typeof arconnect === "object") {
			arconnect.disconnect();

			await delay(500);
			setWallet(defaultWalletValues);
		}
	}, [arconnect]);

	const getWallet = useCallback(
		async (shouldConnect = false) => {
			setLoading(true);
			let a = "";
			if (typeof arconnect === "object") {
				const permissions = [
					"ACCESS_ADDRESS",
					"ENCRYPT",
					"DECRYPT",
					"SIGNATURE"
				];
				try {
					if (shouldConnect) {
						// @ts-ignore
						await arconnect.connect(permissions, {
							name: "Usher",
							logo: LogoImage
						});

						await delay(1000);
					}

					a = await arconnect.getActiveAddress();
				} catch (e) {
					console.error(e);
					// ... ArConnect is loaded but has been disconnected.
				}
			}
			// if (a) {
			// 	const w = new WalletModel(a, arconnect);
			// 	await w.setup();
			// 	if (w.isActive()) {
			// 		setWallet({ ...wallet, address: a });
			// 		console.log(w.getAddress());
			// 	} else {
			// 		console.log(`Wallet ${a} is not active!`);
			// 	}
			// }
			setLoading(false);
			return a;
		},
		[arconnect, wallet]
	);

	useEffect(() => {
		if (typeof arconnect === "object") {
			setArConnectLoaded(true);
		}
		return () => {};
	}, [arconnect]);

	useEffect(() => {
		// Check first if ArConnect has loaded.
		if (isArConnectLoaded) {
			// Check if wallet exists if it does not already exist
			getWallet();
		}

		// getWalletFromQuery();

		return () => {};
	}, [isArConnectLoaded]);

	const value = useMemo(
		() => ({
			wallet,
			loading,
			isArConnectLoaded,
			setWallet,
			removeWallet,
			getWallet
		}),
		[wallet, loading, isArConnectLoaded]
	);

	return (
		<WalletContext.Provider value={value}>{children}</WalletContext.Provider>
	);
};

export default WalletContextProvider;
