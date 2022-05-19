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
import useLocalStorage from "react-use-localstorage";

import useArConnect from "@/hooks/use-arconnect";
import {
	User,
	IUserContext,
	Wallet,
	Chains,
	Connections,
	Profile
} from "@/types";
import delay from "@/utils/delay";
import handleException, {
	setUser as setErrorTrackingUser
} from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
import Authenticate from "@/modules/auth";
import * as api from "@/api";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

type Props = {
	children: React.ReactNode;
};

const defaultValues: User = {
	id: "",
	wallets: [],
	partnerships: [],
	verifications: {
		personhood: false,
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
	}
});

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(true);
	const [isUserFetched, setUserFetched] = useState(false);
	const [lastConnection, setLastConnection] = useLocalStorage(
		"last-connection",
		""
	);
	const [getArConnect, isArConnectLoading] = useArConnect();
	const walletsLoading = isArConnectLoading;

	const removeUser = useCallback(() => setUser(defaultValues), []);

	const getUser = useCallback(async (type: Connections) => {
		// Fetch Currently authenticated User by referring to their connected wallets.
		let id = "";
		const wallets = [];
		const auth = Authenticate.getInstance();
		switch (type) {
			case Connections.ARCONNECT: {
				const arconnect = getArConnect();
				if (arconnect !== null) {
					try {
						const arweaveWalletAddress = await arconnect.getActiveAddress();
						const did = await auth.withArweave(arweaveWalletAddress, arconnect);
						id = did.id;
						const wallet: Wallet = {
							chains: [Chains.ARWEAVE],
							connection: Connections.ARCONNECT,
							address: arweaveWalletAddress,
							active: true
						};
						wallets.push(wallet);
					} catch (e) {
						if (e instanceof Error) {
							handleException(e, null);
						}
					}
				}
				break;
			}
			case Connections.MAGIC: {
				// Authorise Magic Wallet here...
				break;
			}
			default: {
				break;
			}
		}

		if (!id) {
			return defaultValues;
		}

		// Authenticated
		const { success: captcha } = await api.captcha().get(id);
		// const personhood = await checkPersonhood(did.id);
		// Fetch inactive wallets -- filter the existing wallet.
		// Fetch Partnerships

		const fetchedUser = {
			id,
			wallets,
			partnerships: [],
			verifications: { captcha, personhood: false },
			profile: {
				email: ""
			}
		};

		setUser(fetchedUser);
		setErrorTrackingUser(fetchedUser);
		identifyUser(fetchedUser);
		setLastConnection(type);

		return fetchedUser;
	}, []);

	const connect = useCallback(async (type: Connections) => {
		switch (type) {
			case Connections.ARCONNECT: {
				const permissions = [
					"ACCESS_ADDRESS",
					"ENCRYPT",
					"DECRYPT",
					"SIGNATURE"
				];
				// @ts-ignore
				await arconnect.connect(permissions, {
					name: "Usher",
					logo: LogoImage
				});

				await delay(1000);

				return getUser(type);
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
						break;
					}
					case Connections.MAGIC: {
						// Open Magic Link Dialog Here...
						break;
					}
					default: {
						break;
					}
				}
			}

			removeUser();
		},
		[walletsLoading]
	);

	const setCaptcha = useCallback(
		(value: boolean) => {
			const { verifications } = user;
			verifications.captcha = value;
			setUser({
				...user,
				verifications
			});
		},
		[user]
	);

	const setProfile = useCallback(
		(profile: Profile) => {
			setUser({
				...user,
				profile
			});
		},
		[user]
	);

	useEffect(() => {
		if (!walletsLoading && !user.id && !isUserFetched && lastConnection) {
			setLoading(true);
			getUser(lastConnection as Connections).finally(() => {
				setLoading(false);
			});
			setUserFetched(true);
		}
		return () => {};
	}, [user, isUserFetched, walletsLoading, lastConnection]);

	const value = useMemo(
		() => ({
			user,
			loading: loading || walletsLoading,
			getUser,
			connect,
			disconnect,
			setCaptcha,
			setProfile
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
