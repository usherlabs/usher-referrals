/**
 * User provider
 */

import * as api from "@/api";
import { API_OPTIONS, AUTH_OPTIONS } from "@/constants";
import useArConnect from "@/hooks/use-arconnect";
import { Authenticate } from "@usher.so/auth";
import { Connections, Wallet } from "@usher.so/shared";
import { IUserContext, Profile, User } from "@/types";
import { AppEvents, events } from "@/utils/events";
import handleException from "@/utils/handle-exception";
import produce from "immer";
import allSettled from "promise.allsettled";
import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";
import { CampaignReference, Partnerships } from "@usher.so/partnerships";
import { WritableDraft } from "immer/dist/internal";
import { PromiseResult } from "promise.allsettled/types";
import { handleMagicAuthProfileUpdate } from "@/providers/user/HandleMagicAuthProfileUpdate";
import _ from "lodash";
import { authenticateAnyWallet } from "@/providers/user/wallets-and-connections/get-authenticated-wallets";
import { disconnectWallet } from "@/providers/user/wallets-and-connections/disconnect-wallet";
import { StoredWallet, storedWallets } from "@/utils/wallets/stored-wallets";

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

const authenticationInstance = new Authenticate({}, AUTH_OPTIONS);
const partnerships = new Partnerships(authenticationInstance, API_OPTIONS);

function constructNewUser(
	captcha: PromiseResult<{ success: boolean }, unknown>,
	personhood: PromiseResult<
		{
			success: boolean;
			createdAt?: number | undefined;
		},
		unknown
	>,
	profile: WritableDraft<Profile>,
	withWallets: Wallet[]
) {
	return produce((draft: User) => {
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
}

const getUserWithWallets = (withWallets: Wallet[]) => async (user: User) => {
	try {
		const authToken = await authenticationInstance.getAuthToken();
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

		const profileDataSuccess =
			profileData.status === "fulfilled" && profileData.value.success;
		const profile: Profile = profileDataSuccess
			? await handleMagicAuthProfileUpdate(profileData.value.profile)
			: { email: "" };

		return constructNewUser(captcha, personhood, profile, withWallets)(user);
	} catch (e) {
		handleException(e);
		return undefined;
	}
};

export const UserContext = createContext<IUserContext>({
	auth: authenticationInstance,
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

const addPartnershipToUser =
	(partnership: CampaignReference) => async (user: User) => {
		const newPartnerships = await partnerships.addPartnership(partnership);
		events.emit(AppEvents.START_PARTNERSHIP, { partnership });

		return produce(user, (draft) => {
			draft.partnerships = [...newPartnerships];
		});
	};

const useUserState = () => {
	const [user, setUser] = useState<User>(defaultValues);

	// the only difference between using this and setUser is that this will also emit an event
	const updateSavedUserState = useCallback((saved: User) => {
		console.log("SAVED USER", saved);
		setUser(saved);
		events.emit(AppEvents.SAVE_USER, { user: saved });
	}, []);

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
	const saveWallets = useCallback(
		(saved: Wallet[]) => {
			const newUser = produce(user, (draft) => {
				draft.wallets = saved;
			});
			updateSavedUserState(newUser);
		},
		[user, updateSavedUserState]
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
			const authToken = await authenticationInstance.getAuthToken();
			await api.profile(authToken).post(profile);
			events.emit(AppEvents.PROFILE_SAVE, { profile });

			const newUser = produce(user, (draft) => {
				draft.profile = profile;
			});

			updateSavedUserState(newUser);
		},
		[user, updateSavedUserState]
	);

	return {
		user,
		setCaptcha,
		setPersonhood,
		setProfile,
		saveWallets,
		updateSavedUserState
	};
};

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [loading, setLoading] = useState(false);
	const [, isArConnectLoading] = useArConnect();
	const [walletsLoading, setWalletsLoading] = useState(false);

	const {
		user,
		updateSavedUserState,
		saveWallets,
		setProfile,
		setCaptcha,
		setPersonhood
	} = useUserState();

	useEffect(() => {
		setWalletsLoading(isArConnectLoading);
	}, [isArConnectLoading]);

	const addPartnership = useCallback(
		async (partnership: CampaignReference) => {
			const userWithPartnership = await addPartnershipToUser(partnership)(user);
			updateSavedUserState(userWithPartnership);
		},
		[user, updateSavedUserState]
	);

	const loadUserWithWallets = useCallback(
		async (withWallets: Wallet[]) => {
			const newUser = await getUserWithWallets(withWallets)(user);
			if (newUser) {
				updateSavedUserState(newUser);
			}
			console.log("User Data loaded.");
		},
		[updateSavedUserState, user]
	);

	// Only called once on page load
	const loadUser = useCallback(
		() =>
			_.once(async () => {
				console.log("Loading user ...");

				const fetchedWallets: Wallet[] = [];

				const promises: Promise<Wallet[]>[] = [];
				// TODO - commenting until we support multi wallets and accounts. For now, we know
				// 		must load only the present on localStorage one
				// // Load wallet in parallel
				// promises.push(
				// 	getAuthenticatedWalletsAndLoadPartnershipsForConnection({
				// 		connection: Connections.ARCONNECT,
				// 		partnerships,
				// 		authInstance: authenticationInstance
				// 	})
				// );
				// promises.push(
				// 	getAuthenticatedWalletsAndLoadPartnershipsForConnection({
				// 		connection: Connections.MAGIC,
				// 		partnerships,
				// 		authInstance: authenticationInstance
				// 	})
				// );
				// // Calls to @web3-onboard library does not work properly when called asyncronously,
				// // Therefore calling it sequentially
				// promises.push(
				// 	(async () => [
				// 		...(await getAuthenticatedWalletsAndLoadPartnershipsForConnection({
				// 			connection: Connections.COINBASEWALLET,
				// 			partnerships,
				// 			authInstance: authenticationInstance
				// 		})),
				// 		...(await getAuthenticatedWalletsAndLoadPartnershipsForConnection({
				// 			connection: Connections.METAMASK,
				// 			partnerships,
				// 			authInstance: authenticationInstance
				// 		})),
				// 		...(await getAuthenticatedWalletsAndLoadPartnershipsForConnection({
				// 			connection: Connections.WALLETCONNECT,
				// 			partnerships,
				// 			authInstance: authenticationInstance
				// 		}))
				// 	])()
				// );

				// TODO remove this once we support multi wallets
				const unauthenticatedWallets = storedWallets.get();

				promises.push(
					...unauthenticatedWallets.map((wallet) =>
						authenticateAnyWallet({
							wallet,
							partnerships,
							authInstance: authenticationInstance
						})
					)
				);

				const results = await Promise.all(promises);

				results.forEach((wallets) => {
					wallets.forEach((wallet) => {
						if (!fetchedWallets.find((fw) => _.isEqual(fw, wallet))) {
							fetchedWallets.push(wallet);
						}
					});
				});
				saveWallets(fetchedWallets);

				console.log(
					"Wallets loaded. Fetching verifications ...",
					fetchedWallets
				);

				if (fetchedWallets.length > 0) {
					await loadUserWithWallets(fetchedWallets);
				}
			})(),
		[loadUserWithWallets, saveWallets]
	);

	const connect = useCallback(
		async (wallet: StoredWallet) => {
			// TODO - commenting until we support multi wallets and accounts
			//        for now, we will connect only to the newly obtained wallet
			// const newWallets =
			// 	await getAuthenticatedWalletsAndLoadPartnershipsForConnection({
			// 		connection,
			// 		partnerships,
			// 		authInstance: authenticationInstance
			// 	});

			// TODO remove and revise this logic when we support multi wallets.
			//      for now we are unloading partnerships after adding new wallet, as we expect it to be reseted
			//      but in the future we expect not to reset entirely, but maintain consistency only with authenticated ones
			// priority is this being in sync with AUTHENTICATED wallets (i.e. that has signature stored)
			partnerships.unloadAllPartnerships();
			authenticationInstance.removeAll();

			const newWallets = await authenticateAnyWallet({
				wallet,
				partnerships,
				authInstance: authenticationInstance
			});

			// loading user data on every new login as partnerships/profiles are not fetched after owners are merged
			await loadUserWithWallets(newWallets);
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
	}, [loadUser, wallets, loading, walletsLoading]);

	const disconnectAndReset = useCallback(async (connection: Connections) => {
		await disconnectWallet(connection);
		// reload page
		window.location.reload();
	}, []);

	const value = useMemo(
		() => ({
			auth: authenticationInstance,
			user,
			partnerships,
			loading: loading || walletsLoading,
			isAuthenticated: wallets.length > 0,
			connect,
			disconnect: disconnectAndReset,
			setCaptcha,
			setPersonhood,
			setProfile,
			addPartnership
		}),
		[
			user,
			loading,
			walletsLoading,
			wallets.length,
			connect,
			disconnectAndReset,
			setCaptcha,
			setPersonhood,
			setProfile,
			addPartnership
		]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
export default UserContextProvider;
