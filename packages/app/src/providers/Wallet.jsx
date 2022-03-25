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
	const [address, setAddress] = useState("");
	const [loading, setLoading] = useState(true);
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);

	const removeAddress = useCallback(async () => {
		if (typeof arconnect === "object") {
			arconnect.disconnect();

			await delay(500);
			setAddress("");
		}
	}, [arconnect]);

	const getAddress = useCallback(
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
					setAddress(a);
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
			address,
			loading,
			isArConnectLoaded,
			setAddress,
			removeAddress,
			getAddress
		}),
		[address, loading, isArConnectLoaded]
	);

	return (
		<WalletContext.Provider value={value}>{children}</WalletContext.Provider>
	);
};

WalletContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default WalletContextProvider;
