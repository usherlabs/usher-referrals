/**
 * User provider
 */

import * as api from "@/api";
import LogoImage from "@/assets/logo/Logo-Icon.svg";
import useArConnect from "@/hooks/use-arconnect";
import Authenticate from "@/modules/auth";
import {
	CampaignReference,
	Connections,
	IUserContext,
	Profile,
	User,
	Wallet
} from "@/types";
import getArConnect from "@/utils/arconnect";
import delay from "@/utils/delay";
import { AppEvents, events } from "@/utils/events";
import handleException from "@/utils/handle-exception";
import { getMagicClient } from "@/utils/magic-client";
import { onboard } from "@/utils/onboard";
import pascalCase from "@/utils/pascal-case";
import { ethers } from "ethers";
import { toaster } from "evergreen-ui";
import produce from "immer";
import { Base64 } from "js-base64";
import isEqual from "lodash/isEqual";
import once from "lodash/once";
import { destroyCookie, parseCookies } from "nookies";
import allSettled from "promise.allsettled";
import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";

type Props = {
	children: React.ReactNode;
};

const defaultValues: User = {
	wallets: [],
	partnerships: [],
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
		// ...
	},
	async disconnect() {
		// ...
	},
	setCaptcha() {
		// ...
	},
	setPersonhood() {
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

// Only fetch user on page load
let isUserFetched = false;
export const userFetched = () => isUserFetched;

const onWalletsError = (connection: Connections) => {
	toaster.warning(`Could not authenticate with ${pascalCase(connection)}`);
};

// Returns wallets that have been authenticated. Uses the provided connection to authenticate a new connection.
const getWallets = async (type: Connections): Promise<Wallet[]> => {
	// Fetch Currently authenticated User by referring to their connected wallets.
	let wallets: Wallet[] = [];

	const previouslyConnectedWallets = JSON.parse(
		window.localStorage.getItem("connectedWallets") || "[]"
	) as Wallet[];
	const [previouslyConnectedWallet] = previouslyConnectedWallets.filter(
		(w) => w.connection === type
	);

	try {
		const getWalletsWithOnbaord = async (onboardWalletLabel: string) => {
			if (previouslyConnectedWallet) {
				await onboard.connectWallet({
					autoSelect: {
						label: onboardWalletLabel,
						disableModals: true
					}
				});
			}

			const [wallet] = onboard.state
				.get()
				.wallets.filter((w) => w.label === onboardWalletLabel);

			if (wallet && wallet.accounts.length > 0) {
				await authInstance.withEthereum(
					wallet.accounts[0].address,
					type,
					new ethers.providers.Web3Provider(wallet.provider)
				);
			}
		};

		switch (type) {
			case Connections.ARCONNECT: {
				const arconnect = await getArConnect();
				if (arconnect) {
					const arweaveWalletAddress = await arconnect
						.getActiveAddress()
						.catch((e) => console.trace(e));
					if (arweaveWalletAddress) {
						await authInstance.withArweave(
							arweaveWalletAddress,
							type,
							arconnect
						);
					}
				}
				break;
			}
			case Connections.COINBASEWALLET: {
				await getWalletsWithOnbaord("Coinbase Wallet");
				break;
			}
			case Connections.MAGIC: {
				// Produce the user with Magic here...
				const { magic } = getMagicClient();
				const isLoggedIn = await magic.user.isLoggedIn();
				if (isLoggedIn) {
					// Magic will produce and authenticate multiple wallets for each blockchain it supports -- ie. Eth & Arweave
					await authInstance.withMagic();
				}
				break;
			}
			case Connections.METAMASK: {
				await getWalletsWithOnbaord("MetaMask");
				break;
			}
			case Connections.WALLETCONNECT: {
				await getWalletsWithOnbaord("WalletConnect");
				break;
			}
			default: {
				break;
			}
		}
		wallets = authInstance.getWallets();
	} catch (e) {
		onWalletsError(type);
		handleException(e);
	}

	return wallets;
};

// Connect a new wallet and return new wallets array
// For magic wallet connection -- redirect to magic/login
const connectWallet = async (type: Connections): Promise<Wallet[]> => {
	switch (type) {
		case Connections.ARCONNECT: {
			const arconnect = await getArConnect();
			if (arconnect !== null) {
				const permissions = ["ACCESS_ADDRESS", "SIGNATURE"];
				// @ts-ignore
				await arconnect.connect(permissions, {
					name: "Usher",
					logo: LogoImage
				});

				await delay(1000);
				return getWallets(type);
			}
			break;
		}
		case Connections.COINBASEWALLET: {
			await onboard.connectWallet({
				autoSelect: { disableModals: true, label: "Coinbase Wallet" }
			});

			return getWallets(type);
		}
		case Connections.MAGIC: {
			const { magic } = getMagicClient();
			const isLoggedIn = await magic.user.isLoggedIn();
			if (isLoggedIn) {
				// Will only be reached if the user is authorised.
				return getWallets(type);
			}
			// Redirect to magic login page
			window.location.href = "/magic/login"; //* Important to use window.location.href for a full page reload.
			break;
		}
		case Connections.METAMASK: {
			await onboard.connectWallet({
				autoSelect: { disableModals: true, label: "MetaMask" }
			});

			return getWallets(type);
		}
		case Connections.WALLETCONNECT: {
			await onboard.connectWallet({
				autoSelect: { disableModals: true, label: "WalletConnect" }
			});

			return getWallets(type);
		}
		default: {
			break;
		}
	}

	return [];
};

const disconnectWallet = async (type: Connections) => {
	switch (type) {
		case Connections.ARCONNECT: {
			const arconnect = await getArConnect();
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
			window.location.href = "/magic/logout";
			break;
		}
		default: {
			break;
		}
	}
};

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(false);
	const [, isArConnectLoading] = useArConnect();
	const [walletsLoading, setWalletsLoading] = useState(false);

	useEffect(() => {
		setWalletsLoading(isArConnectLoading);
	}, [isArConnectLoading]);

	const saveUser = useCallback((saved: User) => {
		console.log("SAVED USER", saved);
		setUser(saved);
		events.emit(AppEvents.SAVE_USER, { user: saved });
	}, []);

	const saveWallets = useCallback(
		(saved: Wallet[]) => {
			const newUser = produce(user, (draft) => {
				draft.wallets = saved;
			});
			saveUser(newUser);
		},
		[user]
	);

	const setCaptcha = useCallback(
		(value: boolean) => {
			events.emit(AppEvents.CAPTCHA, { value });
			setUser(
				produce(user, (draft) => {
					draft.verifications.captcha = value;
				})
			);
		},
		[user]
	);

	const setPersonhood = useCallback(
		(value: number | boolean) => {
			events.emit(AppEvents.PERSONHOOD, { value });
			setUser(
				produce(user, (draft) => {
					draft.verifications.personhood = value;
				})
			);
		},
		[user]
	);

	const setProfile = useCallback(
		async (profile: Profile) => {
			// Save profile
			const authToken = await authInstance.getAuthToken();
			await api.profile(authToken).post(profile);
			events.emit(AppEvents.PROFILE_SAVE, { profile });

			const newUser = produce(user, (draft) => {
				draft.profile = profile;
			});

			saveUser(newUser);
		},
		[user]
	);

	const addPartnership = useCallback(
		async (partnership: CampaignReference) => {
			const partnerships = await authInstance.addPartnership(partnership);
			events.emit(AppEvents.START_PARTNERSHIP, { partnership });

			const newUser = produce(user, (draft) => {
				draft.partnerships = [...partnerships];
			});

			saveUser(newUser);
		},
		[user]
	);

	const loadUserWithWallets = useCallback(async (withWallets: Wallet[]) => {
		// get partnerships
		const partnerships = authInstance.getPartnerships();

		// Load verifications and profile
		const authToken = await authInstance.getAuthToken();
		const [captcha, personhood, profileData] = await allSettled<
			[
				{ success: boolean },
				{ success: boolean; createdAt?: number },
				{ success: boolean; profile: Profile }
			]
		>([
			api.captcha(authToken).get(),
			api.personhood(authToken).get(),
			api.profile(authToken).get()
		]);
		console.log("User Data loaded.");
		let profile: Profile =
			profileData.status === "fulfilled" && profileData.value.success
				? profileData.value.profile
				: { email: "" };

		// Handle Magic Auth Profile Update
		const cookies = parseCookies();
		const magicConnectToken = cookies.__usher_magic_connect;
		if (magicConnectToken && !profile.email) {
			try {
				const response = JSON.parse(Base64.decode(magicConnectToken));
				// Do something with the email -- response.userMetadata.email
				const newProfile = {
					...(profile || {}),
					email: response.userMetadata.email
				};
				await setProfile(newProfile);
				profile = newProfile;
				console.log("Magic Profile Updated!");
			} catch (e) {
				handleException(e);
			}
		}
		// Destroy the cookie on success
		destroyCookie(null, "__usher_magic_connect", {
			maxAge: 24 * 60 * 60, // 1 days
			path: "/"
		});

		const newUser = produce(user, (draft) => {
			draft.wallets = withWallets;
			draft.partnerships = partnerships;
			if (profile) {
				draft.profile = profile;
			}
			draft.verifications = {
				personhood:
					personhood.status === "fulfilled" && personhood.value.success
						? personhood.value.createdAt || true
						: false,
				captcha: captcha.status === "fulfilled" && captcha.value.success
			};
		});

		saveUser(newUser);
	}, []);

	// Only called once on page load
	const loadUser = useCallback(
		once(async () => {
			console.log("Loading user ...");

			const fetchedWallets: Wallet[] = [];
			for (const connection of Object.values(Connections)) {
				// We are traversing all the supported connections one by one synchronously
				// eslint-disable-next-line no-await-in-loop
				const wallets = await getWallets(connection);
				saveWallets(wallets);
				wallets.forEach((wallet) => {
					if (!fetchedWallets.find((fw) => isEqual(fw, wallet))) {
						fetchedWallets.push(wallet);
					}
				});
			}

			console.log("Wallets loaded. Fetching verifications ...", fetchedWallets);

			if (fetchedWallets.length > 0) {
				await loadUserWithWallets(fetchedWallets);
			}
		}),
		[]
	);

	const connect = useCallback(async (type: Connections) => {
		const newWallets = await connectWallet(type);
		await loadUserWithWallets(newWallets); // loading user data on every new login as partnerships/profiles are not fetched after owners are merged
		events.emit(AppEvents.CONNECT, { wallets: newWallets });
	}, []);

	const { wallets } = user;
	useEffect(() => {
		if (!walletsLoading && !isUserFetched && !loading && wallets.length === 0) {
			isUserFetched = true;
			setLoading(true);
			loadUser().finally(() => {
				setLoading(false);
			});
		}
		return () => {};
	}, [wallets, loading, walletsLoading]);

	const value = useMemo(
		() => ({
			user,
			loading: loading || walletsLoading,
			connect,
			disconnect: disconnectWallet,
			setCaptcha,
			setPersonhood,
			setProfile,
			addPartnership
		}),
		[user, loading, walletsLoading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
