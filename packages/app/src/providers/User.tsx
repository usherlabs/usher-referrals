/**
 * User provider
 * Uses 3id to authorise access to Affiliate Streams.
 * Network is required to track all affiliates in their own Stream
 * https://developers.ceramic.network/reference/accounts/3id-did/
 */

import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";
import produce from "immer";
import allSettled from "promise.allsettled";
import { useRouter } from "next/router";
import useAsyncEffect from "use-async-effect";
import once from "lodash/once";

import useArConnect from "@/hooks/use-arconnect";
import {
	User,
	IUserContext,
	Wallet,
	Connections,
	Profile,
	CampaignReference
} from "@/types";
import delay from "@/utils/delay";
import handleException, {
	setUser as setErrorTrackingUser
} from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
import Authenticate from "@/modules/auth";
import getMagicClient from "@/utils/magic-client";
// import * as api from "@/api";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

type Props = {
	children: React.ReactNode;
};

const defaultValues: User = {
	wallets: [],
	verifications: {
		personhood: null,
		captcha: false
	},
	profile: {
		email: ""
	}
};

export const UserContext = createContext<IUserContext>({
	user: defaultValues,
	loading: false,
	async connect() {
		return defaultValues;
	},
	async disconnect() {
		// ...
	},
	setCaptcha() {
		// ...
	},
	setProfile() {
		// ...
	},
	async addPartnership() {
		// ...
	}
});

const authInstance = Authenticate.getInstance();

// Only fetch user on page load
let isUserFetched = false;

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(false);
	const [getArConnect, isArConnectLoading] = useArConnect();
	const router = useRouter();
	const walletsLoading = isArConnectLoading;

	const saveUser = useCallback((saved: User) => {
		setUser(saved);
		setErrorTrackingUser(saved);
		identifyUser(
			saved.profile.email || saved.wallets.map((w) => w.address).join("|"),
			saved
		);
	}, []);

	// const removeUser = useCallback(() => {
	// 	setUser(defaultValues);
	// 	setErrorTrackingUser(null);
	// 	identifyUser(null);
	// }, []);

	// Returns wallets that have been authenticated. Uses the provided connection to authenticate a new connection.
	const getWallets = useCallback(
		async (type: Connections): Promise<Wallet[]> => {
			// Fetch Currently authenticated User by referring to their connected wallets.
			let wallets: Wallet[] = [];
			switch (type) {
				case Connections.ARCONNECT: {
					const arconnect = getArConnect();
					if (arconnect) {
						try {
							const arweaveWalletAddress = await arconnect.getActiveAddress();
							await authInstance.withArweave(
								arweaveWalletAddress,
								arconnect,
								type
							);
							wallets = authInstance.getWallets();
						} catch (e) {
							if (e instanceof Error) {
								handleException(e, null);
							}
						}
					}
					break;
				}
				case Connections.MAGIC: {
					try {
						// Produce the user with Magic here...
						const { magic } = getMagicClient();
						const isLoggedIn = await magic.user.isLoggedIn();
						if (isLoggedIn) {
							await authInstance.withMagic();
							// Magic will produce and authenticate multiple wallets for each blockchain it supports -- ie. Eth & Arweave
							wallets = authInstance.getWallets();
						}
					} catch (e) {
						if (e instanceof Error) {
							handleException(e, null);
						}
					}
					break;
				}
				default: {
					break;
				}
			}

			if (wallets.length === 0) {
				// Ensure that the saved connection is removed if no wallets returned.
				return [];
			}

			return wallets;

			// // Authenticated
			// // const { success: captcha } = await api.captcha().get(id);
			// // const personhood = await checkPersonhood(did.id);

			// const newUser = produce(user, (draft) => {
			// 	draft.wallets = wallets;
			// 	draft.verifications = { captcha: false, personhood: null };
			// });

			// saveUser(newUser);

			// return newUser;
		},
		[]
	);

	const saveWallets = useCallback(
		(saved: Wallet[]) => {
			console.log("SAVED", saved);
			const newUser = produce(user, (draft) => {
				draft.wallets = saved;
			});
			saveUser(newUser);
		},
		[user]
	);

	const connect = useCallback(async (type: Connections) => {
		switch (type) {
			case Connections.ARCONNECT: {
				const arconnect = getArConnect();
				if (arconnect !== null) {
					const permissions = ["ACCESS_ADDRESS", "SIGNATURE"];
					// @ts-ignore
					await arconnect.connect(permissions, {
						name: "Usher",
						logo: LogoImage
					});

					await delay(1000);
					const newWallets = await getWallets(type);
					saveWallets(newWallets);
					return newWallets;
				}
				break;
			}
			case Connections.MAGIC: {
				const { magic } = getMagicClient();
				const isLoggedIn = await magic.user.isLoggedIn();
				if (isLoggedIn) {
					// Will only be reached if the user is authorised.
					const newWallets = await getWallets(type);
					saveWallets(newWallets);
					return newWallets;
				}
				// Redirect to magic login page
				window.location.href = "/magic/login"; //* Important to use window.location.href for a full page reload.
				break;
			}
			default: {
				break;
			}
		}

		return defaultValues.wallets;
	}, []);

	// Reloading the screen will refresh authentications
	const disconnect = useCallback(async (type: Connections) => {
		switch (type) {
			case Connections.ARCONNECT: {
				const arconnect = getArConnect();
				if (arconnect !== null) {
					await arconnect.disconnect();
					await delay(500);
				}

				// Reload the screen when a user disconnects their wallet
				window.location.reload();
				break;
			}
			case Connections.MAGIC: {
				// Open Magic Link Dialog Here...
				router.push("/magic/logout");
				break;
			}
			default: {
				break;
			}
		}
	}, []);

	const setCaptcha = useCallback(
		(value: boolean) => {
			setUser(
				produce(user, (draft) => {
					draft.verifications.captcha = value;
				})
			);
		},
		[user]
	);

	const setProfile = useCallback(
		(profile: Profile) => {
			setUser(
				produce(user, (draft) => {
					draft.profile = profile;
				})
			);
		},
		[user]
	);

	const addPartnership = useCallback(
		async (walletData: string | Wallet, partnership: CampaignReference) => {
			let walletAddress = "";
			if (typeof walletData === "string") {
				walletAddress = walletData;
			} else {
				walletAddress = walletData.address;
			}
			const auth = await authInstance.getAuth(walletAddress);
			const partnerships = await auth.addPartnership(partnership);
			setUser(
				produce(user, (draft) => {
					draft.wallets = user.wallets.map((wallet) => {
						if (wallet.address === walletAddress) {
							wallet.partnerships = partnerships;
						}
						return wallet;
					});
				})
			);
		},
		[user]
	);

	const loadUser = useCallback(async () => {
		await allSettled(
			Object.values(Connections).map((value) =>
				getWallets(value).then((fetched) => {
					saveWallets(fetched);
				})
			)
		);
		// const newWallets: Wallet[] = [];
		// results.forEach((res) => {
		// 	if (res.status === "fulfilled" && !!res.value) {
		// 		res.value.forEach((authedWallet) => {
		// 			if (!newWallets.find((w) => w.address === authedWallet.address)) {
		// 				newWallets.push(authedWallet);
		// 			}
		// 		});
		// 	}
		// });
		// const newUser = produce(user, (draft) => {
		// 	draft.wallets = newWallets;
		// });
		// saveUser(newUser);
	}, []);

	// useEffect(() => {
	// 	(async () => {
	// 		const { magic } = getMagicClient();
	// 		const isLoggedIn = await magic.user.isLoggedIn();
	// 		console.log("is logged in", isLoggedIn);
	// 	})();
	// }, []);

	const { wallets } = user;
	useEffect(() => {
		console.log({
			isUserFetched,
			walletsLoading,
			loading,
			wallets
		});
		if (!walletsLoading && !isUserFetched && !loading && wallets.length === 0) {
			console.log({
				fetching: true,
				isUserFetched,
				walletsLoading,
				loading
			});
			isUserFetched = true;
			setLoading(true);
			loadUser().finally(() => {
				setLoading(false);
			});
		}
		return () => {};
	}, [wallets, loading, walletsLoading]);

	console.log(user);

	// useAsyncEffect(
	// 	async (isActive) => {
	// 		if (!walletsLoading) {
	// 			if (!isUserFetched) {
	// 				// return;
	// 				if (user.wallets.length === 0 && isActive()) {
	// 					setLoading(true);
	// 					setUserFetched(true);
	// 					try {
	// 						await allSettled(
	// 							Object.values(Connections).map((values) => getUser(values))
	// 						);
	// 					} catch (e) {
	// 						// ...
	// 					}
	// 					setLoading(false);
	// 				}
	// 			}
	// 		}
	// 	},
	// 	[getUser, user, isUserFetched, walletsLoading]
	// );

	const value = useMemo(
		() => ({
			user,
			loading: loading || walletsLoading,
			connect,
			disconnect,
			setCaptcha,
			setProfile,
			addPartnership
		}),
		[user, loading, walletsLoading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
