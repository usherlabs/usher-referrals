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

import { ChildrenProps } from "@/utils/common-prop-types";
import delay from "@/utils/delay";
import handleException from "@/utils/handle-exception";
import { saveWallet, getSkippedWallet } from "@/actions/wallet";
import { saveInviteLink } from "@/actions/invite";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

import { UserContext } from "./User";

export const WalletContext = createContext();

const saveWalletOnce = once(saveWallet);
const saveInviteLinkOnce = once(saveInviteLink);
const getSkippedWalletOnce = once(getSkippedWallet);

const WalletContextProvider = ({ children }) => {
	const arconnect = useArConnect();
	const [wallet, setWallet] = useState({
		address: "",
		link: {
			id: "",
			conversions: { total: 0, pending: 0, success: 0 }
		}
	});
	const [loading, setLoading] = useState(false);
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);
	const [isMounted, setMounted] = useState(false);
	const { user } = useContext(UserContext);
	const { address } = wallet;
	const { id: userId } = user;

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
					setWallet({ address: a, ...wallet });
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

	useEffect(() => {
<<<<<<< HEAD
		if (isMounted) {
			return () => {};
		}
		if (!isEmpty(address) && !isEmpty(userId)) {
			setMounted(true);
			(async () => {
				try {
					const { id: walletId } = await saveWalletOnce(user, address);
					const [{ id: linkId }, conversions] = await saveInviteLinkOnce(
						walletId
					);
					setWallet({
						...wallet,
						id: walletId,
						link: { id: linkId, conversions }
					}); // set ids to state
				} catch (e) {
					handleException(e);
				}
			})();
=======
		if (!isEmpty(userId)) {
			if (isEmpty(address)) {
				// Check if the address is skipped
				(async () => {
					const { id: walletId, address: a } = await getSkippedWalletOnce(user);
					if (walletId) {
						setWallet({
							...wallet,
							address: a,
							id: walletId
						});
					}
				})();
			} else {
				(async () => {
					try {
						const { id: walletId } = await saveWalletOnce(user, address);
						const [{ id: linkId }, conversions] = await saveInviteLinkOnce(
							walletId
						);
						setWallet({
							...wallet,
							id: walletId,
							link: { id: linkId, conversions }
						}); // set ids to state
					} catch (e) {
						handleException(e);
					}
				})();
			}
>>>>>>> fbb8b5e (skipped wallet fetch from database)
		}
		return () => {};
	}, [address, userId, isMounted]);

	useEffect(() => {
		// Check first if ArConnect has loaded.
		if (isArConnectLoaded) {
			// Check if wallet exists if it does not already exist
			getWallet();
		}

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

WalletContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default WalletContextProvider;
