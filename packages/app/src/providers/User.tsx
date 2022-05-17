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

import useArConnect from "@/hooks/use-arconnect";
import { User, IUserContext, Wallet, Networks } from "@/types";
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
	}
};

export const UserContext = createContext<IUserContext>({
	user: defaultValues,
	loading: false,
	async getUser() {
		return defaultValues;
	},
	async connect() {
		// ...
	},
	async disconnectAll() {
		// ...
	}
});

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(true);
	const [isUserFetched, setUserFetched] = useState(false);
	const [getArConnect, isArConnectLoading] = useArConnect();
	const walletsLoading = isArConnectLoading;

	const removeUser = useCallback(() => setUser(defaultValues), []);

	const getUser = useCallback(async () => {
		// Fetch Currently authenticated User by referring to their connected wallets.
		let id = "";
		const wallets = [];
		const auth = Authenticate.getInstance();
		const arconnect = getArConnect();
		if (arconnect !== null) {
			try {
				const arweaveWalletAddress = await arconnect.getActiveAddress();
				const did = await auth.withArweave(arweaveWalletAddress, arconnect);
				id = did.id;
				const wallet: Wallet = {
					network: Networks.ARWEAVE,
					address: arweaveWalletAddress,
					managed: false,
					active: true
				};
				wallets.push(wallet);
			} catch (e) {
				if (e instanceof Error) {
					handleException(e, null);
				}
			}
		}

		if (!id) {
			return null;
		}

		// Authenticated
		const { success: captcha } = await api.captcha().get(id);
		// const personhood = await checkPersonhood(did.id);
		// Fetch inactive wallets
		// Fetch Partnerships

		const fetchedUser = {
			id,
			wallets,
			partnerships: [],
			verifications: { captcha, personhood: false }
		};

		setUser(fetchedUser);
		setErrorTrackingUser(fetchedUser);
		identifyUser(fetchedUser);

		return null;
	}, []);

	const connect = useCallback(async () => {
		const permissions = ["ACCESS_ADDRESS", "ENCRYPT", "DECRYPT", "SIGNATURE"];
		// @ts-ignore
		await arconnect.connect(permissions, {
			name: "Usher",
			logo: LogoImage
		});

		await delay(1000);

		return getUser();
	}, []);

	const disconnectAll = useCallback(async () => {
		if (!walletsLoading) {
			const arconnect = getArConnect();
			if (arconnect !== null) {
				await arconnect.disconnect();
				await delay(500);
			}
		}

		removeUser();
	}, [walletsLoading]);

	useEffect(() => {
		if (!walletsLoading && !user.id && !isUserFetched) {
			setLoading(true);
			getUser().finally(() => {
				setLoading(false);
			});
			setUserFetched(true);
		}
		return () => {};
	}, [user, isUserFetched, walletsLoading]);

	const value = useMemo(
		() => ({
			user,
			loading: loading || walletsLoading,
			getUser,
			connect,
			disconnectAll
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
