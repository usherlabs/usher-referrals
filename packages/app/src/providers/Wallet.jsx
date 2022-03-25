import React, {
	createContext,
	useState,
	useMemo,
	useCallback,
	useEffect
} from "react";
import get from "lodash/get";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";

import { ChildrenProps } from "@/utils/common-prop-types";
import delay from "@/utils/delay";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

export const WalletContext = createContext();

const getFromSSR = () => {
	if (typeof window === "undefined") {
		return {};
	}
	// If window is defined, retrieve user object from SSR directly. -- Hack but will work.
	return get(window, "__NEXT_DATA__.props.pageProps.wallet", {});
};

const WalletContextProvider = ({ children }) => {
	const fromSSR = getFromSSR();
	const arconnect = useArConnect();
	const [address, setAddressState] = useState(() => fromSSR);
	const [loading, setLoading] = useState(() => isEmpty(fromSSR));
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);

	const setAddress = useCallback((param) => {
		if (!param || param !== "string") {
			return "";
		}
		setAddressState(param);
		return param;
	}, []);

	const removeAddress = useCallback(() => setAddressState(""), []);

	const getAddress = useCallback(async (shouldConnect = false) => {
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
	}, []);

	useEffect(() => {
		if (typeof arconnect === "object") {
			setArConnectLoaded(true);
		}
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
