import React, {
	createContext,
	useState,
	useMemo,
	useCallback,
	useEffect
} from "react";
import useArConnect from "use-arconnect";

import { ChildrenProps } from "@/utils/common-prop-types";
import delay from "@/utils/delay";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

export const WalletContext = createContext();

const WalletContextProvider = ({ children }) => {
	const arconnect = useArConnect();
	const [wallet, setWallet] = useState({});
	const [loading, setLoading] = useState(true);
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);

	const removeWallet = useCallback(async () => {
		if (typeof arconnect === "object") {
			arconnect.disconnect();

			await delay(500);
			setWallet({});
		}
	}, [arconnect]);

	const getWallet = useCallback(
		async (shouldConnect = false) => {
			setLoading(true);
			if (typeof arconnect === "object") {
				try {
					if (shouldConnect) {
						await arconnect.connect(["ACCESS_ADDRESS"], {
							name: "Usher",
							logo: LogoImage
						});

						await delay(1000);
					}

					const a = await arconnect.getActiveAddress();
					setWallet({ address: a });
					setLoading(false);
					return a;
				} catch (e) {
					// ... ArConnect is loaded but has been disconnected.
				}
			}
			setLoading(false);
			return "";
		},
		[arconnect]
	);

	useEffect(() => {
		if (typeof arconnect === "object") {
			setArConnectLoaded(true);
		}
		return () => {};
	}, [arconnect]);

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

WalletContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default WalletContextProvider;
