import React, {
	createContext,
	useState,
	useMemo,
	useCallback,
	useEffect,
	useContext
} from "react";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";
import once from "lodash/once";

import { User, Wallet, IWalletContext } from "@/types";
import delay from "@/utils/delay";
import handleException from "@/utils/handle-exception";
import { saveWallet, getSkippedWallet } from "@/actions/wallet";
import { saveInviteLink } from "@/actions/invite";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

import { UserContext } from "./User";

type Props = {
	children: React.ReactNode;
};

type ArConnectConnect = (
	permissions: [string],
	options: { name: string; logo: string }
) => Promise<void>;

const defaultWalletValues = {
	address: "",
	link: {
		id: "",
		conversions: { total: 0, pending: 0, success: 0 }
	}
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

const saveWalletOnce = once(saveWallet);
const saveInviteLinkOnce = once(saveInviteLink);
const getSkippedWalletOnce = once(getSkippedWallet);

const WalletContextProvider: React.FC<Props> = ({ children }) => {
	const arconnect = useArConnect();
	const [wallet, setWalletState] = useState(defaultWalletValues);
	const [loading, setLoading] = useState(false);
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);
	const [isMounted, setMounted] = useState(false);
	const { user } = useContext(UserContext);
	const { address } = wallet;
	let userId = "";
	if (user !== null) {
		userId = user.id;
	}

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

	const skipWallet = useCallback(() => {
		// ...
	}, []);

	const getWalletFromQuery = useCallback(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const skipWalletVal = searchParams.get("skip_wallet");
		const shouldSkipWallet = skipWalletVal === "true";
		if (shouldSkipWallet && !address) {
			skipWallet();
		}
	}, [address]);

	const getWallet = useCallback(
		async (shouldConnect = false) => {
			setLoading(true);
			if (typeof arconnect === "object") {
				try {
					if (shouldConnect) {
						const connect = arconnect.connect as ArConnectConnect;
						await connect(["ACCESS_ADDRESS"], {
							name: "Usher",
							logo: LogoImage
						});

						await delay(1000);
					}

					const a = await arconnect.getActiveAddress();
					setWallet({ ...wallet, address: a });
					setLoading(false);
					return a;
				} catch (e) {
					// ... ArConnect is loaded but has been disconnected.
				}
			}
			setLoading(false);
			return "";
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
		if (isMounted) {
			return () => {};
		}
		if (!isEmpty(userId)) {
			setMounted(true);
			(async () => {
				try {
					// let walletId = "";
					// let walletAddress = "";
					// if (isEmpty(address)) {
					// 	// Check if the address is skipped
					// 	const { id: wid, address: a } = await getSkippedWalletOnce(
					// 		user as User
					// 	);
					// 	walletAddress = a;
					// 	walletId = wid;
					// } else {
					// 	// This conditional block will be hit when a user clicks the "Connect Wallet Later"
					// 	const { id: wid } = await saveWalletOnce(user as User, address);
					// 	walletAddress = address;
					// 	walletId = wid;
					// }
					// const [{ id: linkId }, conversions] = await saveInviteLinkOnce(
					// 	walletId
					// );
					// setWallet({
					// 	...wallet,
					// 	address: walletAddress,
					// 	link: { id: linkId, conversions }
					// }); // set ids to state
				} catch (e) {
					if (e instanceof Error) {
						handleException(e, null);
					}
				}
			})();
		}
		return () => {};
	}, [address, userId, isMounted]);

	useEffect(() => {
		// Check first if ArConnect has loaded.
		if (isArConnectLoaded) {
			// Check if wallet exists if it does not already exist
			getWallet();
		}

		getWalletFromQuery();

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
