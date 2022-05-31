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
	async getUser() {
		return defaultValues;
	},
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
	addPartnership() {
		// ...
	}
});

const authInstance = Authenticate.getInstance();

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(true);
	const [isUserFetched, setUserFetched] = useState(false);
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

	const getUser = useCallback(
		async (type: Connections) => {
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
				return defaultValues;
			}

			// Authenticated
			// const { success: captcha } = await api.captcha().get(id);
			// const personhood = await checkPersonhood(did.id);

			const newUser = produce(user, (draft) => {
				draft.wallets = wallets;
				draft.verifications = { captcha: false, personhood: null };
			});

			saveUser(newUser);

			return newUser;
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
					return getUser(type);
				}
				break;
			}
			case Connections.MAGIC: {
				const { magic } = getMagicClient();
				const isLoggedIn = await magic.user.isLoggedIn();
				if (isLoggedIn) {
					// Will only be reached if the user is authorised.
					return getUser(type);
				}
				// Redirect to magic login page
				window.location.href = "/magic/login"; //* Important to use window.location.href for a full page reload.
				break;
			}
			default: {
				break;
			}
		}

		return defaultValues;
	}, []);

	const disconnect = useCallback(
		async (type: Connections) => {
			if (!walletsLoading) {
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
			}
		},
		[walletsLoading]
	);

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

	useEffect(() => {
		(async () => {
			const { magic } = getMagicClient();
			const isLoggedIn = await magic.user.isLoggedIn();
			console.log("is logged in", isLoggedIn);
		})();
	}, []);

	useEffect(() => {
		if (!walletsLoading) {
			if (isUserFetched) {
				return () => {};
			}
			if (user.wallets.length === 0) {
				setLoading(true);
				setUserFetched(true);
				allSettled(
					Object.values(Connections).map((values) => getUser(values))
				).finally(() => {
					setLoading(false);
				});
			}
		}
		return () => {};
	}, [user, isUserFetched, walletsLoading]);

	const value = useMemo(
		() => ({
			user,
			loading: loading || walletsLoading,
			getUser,
			connect,
			disconnect,
			setCaptcha,
			setProfile,
			addPartnership
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
