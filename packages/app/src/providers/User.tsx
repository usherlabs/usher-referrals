/**
 * User provider
 */

import * as api from "@/api";
import { API_OPTIONS, AUTH_OPTIONS, ETHEREUM_CHAIN_ID } from "@/constants";
import useArConnect from "@/hooks/use-arconnect";
import { Authenticate } from "@usher.so/auth";
import { Connections, Wallet } from "@usher.so/shared";
import { IUserContext, Profile, User } from "@/types";
import getArConnect from "@/utils/arconnect";
import delay from "@/utils/delay";
import { AppEvents, events } from "@/utils/events";
import handleException from "@/utils/handle-exception";
import { getMagicClient } from "@/utils/magic-client";
import { onboard } from "@/utils/onboard";
import pascalCase from "@/utils/pascal-case";
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

// import { getArweaveClient } from "@/utils/arweave-client";
import { getEthereumClient } from "@/utils/ethereum-client";
import { ethers } from "ethers";
import { CampaignReference, Partnerships } from "@usher.so/partnerships";

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

// const arweave = getArweaveClient();
const ethProvider = getEthereumClient() as ethers.providers.Web3Provider;
const authInstance = new Authenticate(
	{
		// arweave,
		ethereum: ethProvider
	},
	AUTH_OPTIONS
);
const partnerships = new Partnerships(authInstance, API_OPTIONS);

export const UserContext = createContext<IUserContext>({
	auth: authInstance,
	user: defaultValues,
	partnerships,
	loading: false,
	isAuthenticated: false,
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
			const getWallet = () => {
				const [wallet] = onboard()
					.state.get()
					.wallets.filter((w) => w.label === onboardWalletLabel);
				return wallet;
			};

			if (previouslyConnectedWallet) {
				const wallet = getWallet();
				if (!wallet) {
					await onboard().connectWallet({
						autoSelect: {
							label: onboardWalletLabel,
							disableModals: true
						}
					});
				}
			}

			const wallet = getWallet();

			if (wallet) {
				if (wallet.chains[0].id !== ETHEREUM_CHAIN_ID) {
					const succcess = await onboard().setChain({
						chainId: ETHEREUM_CHAIN_ID,
						wallet: onboardWalletLabel
					});

					if (!succcess) {
						const freshWallet = getWallet();
						if (freshWallet.chains[0].id !== ETHEREUM_CHAIN_ID) {
							console.log("network NOT changed");
							return;
						}
					}
					console.log("network changed");
				}

				if (wallet && wallet.accounts.length > 0) {
					await authInstance.withEthereum(wallet.accounts[0].address, type);
					await partnerships.loadRelatedPartnerships();
				}
			}
		};

		switch (type) {
			case Connections.ARCONNECT: {
				const arConnect = await getArConnect();
				if (arConnect) {
					const arweaveWalletAddress = await arConnect
						.getActiveAddress()
						.catch((e) => console.trace(e));
					if (arweaveWalletAddress) {
						await authInstance.withArweave(
							arweaveWalletAddress,
							type,
							arConnect
						);
						await partnerships.loadRelatedPartnerships();
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
				const { magic, ethProvider: magicEthProvider } = getMagicClient();
				authInstance.setProvider("magic", magicEthProvider);
				const isLoggedIn = await magic.user.isLoggedIn();
				if (isLoggedIn) {
					// Magic will produce and authenticate multiple wallets for each blockchain it supports -- ie. Eth & Arweave
					await authInstance.withMagic();
					await partnerships.loadRelatedPartnerships();
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
			const newPartnerships = await partnerships.addPartnership(partnership);
			events.emit(AppEvents.START_PARTNERSHIP, { partnership });

			const newUser = produce(user, (draft) => {
				draft.partnerships = [...newPartnerships];
			});

			saveUser(newUser);
		},
		[user]
	);

	const loadUserWithWallets = useCallback(async (withWallets: Wallet[]) => {
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
			draft.partnerships = partnerships.getPartnerships();
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
				// Load the first wallet to auto-authenticate
				// eslint-disable-next-line no-await-in-loop
				const wallets = await getWallets(connection);
				saveWallets(wallets);
				wallets.forEach((wallet) => {
					if (!fetchedWallets.find((fw) => isEqual(fw, wallet))) {
						fetchedWallets.push(wallet);
					}
				});
				if (wallets.length > 0) {
					break;
				}
			}

			console.log("Wallets loaded. Fetching verifications ...", fetchedWallets);

			if (fetchedWallets.length > 0) {
				await loadUserWithWallets(fetchedWallets);
			}
		}),
		[]
	);

	const connect = useCallback(
		async (type: Connections) => {
			const newWallets = await getWallets(type);
			await loadUserWithWallets(newWallets); // loading user data on every new login as partnerships/profiles are not fetched after owners are merged
			events.emit(AppEvents.CONNECT, { wallets: newWallets });
		},
		[loadUserWithWallets]
	);

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
			auth: authInstance,
			user,
			partnerships,
			loading: loading || walletsLoading,
			isAuthenticated: wallets.length > 0,
			connect,
			disconnect: disconnectWallet,
			setCaptcha,
			setPersonhood,
			setProfile,
			addPartnership
		}),
		[user, loading, walletsLoading, wallets]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
