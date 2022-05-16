/**
 * User provider
 * Uses 3id to authorise access to Affiliate Streams.
 * Network is required to track all affiliates in their own Stream
 * https://developers.ceramic.network/reference/accounts/3id-did/
 */

import isEmpty from "lodash/isEmpty";
import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdConnect } from "@3id/connect";

import useArConnect from "@/hooks/use-arconnect";
import { User, IUserContext, Wallet } from "@/types";
import { authorise, checkCaptcha, getProfile } from "@/actions/user";
import delay from "@/utils/delay";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
import auth from "@/utils/auth-client";

// TODO: Think we need to use the CAIP-10 link mechanism for this... it's a dedicated stream type for verified blockchain linking.
// https://developers.ceramic.network/reference/stream-programs/caip10-link/
// https://github.com/ceramicnetwork/js-ceramic/blob/develop/packages/blockchain-utils-linking/src/filecoin.ts

// Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
const threeID = new ThreeIdConnect();

class Authenticate {
	static async withArConnect(
		walletAddress: string,
		arConnectProvider: typeof window.arweaveWallet
	) {
		const ceramic = new CeramicClient();
		const encoder = new TextEncoder();
		const data = encoder.encode(walletAddress);
		const sig = await arConnectProvider.signature(data, "RSASSA-PKCS1-v1_5");

		console.log(sig);
	}
}

type Props = {
	children: React.ReactNode;
};

const defaultValues = {
	id: "",
	wallets: [],
	partnerships: {
		id: "",
		records: []
	},
	verifications: {
		personhood: false,
		captcha: false
	}
};

export const UserContext = createContext<IUserContext>({
	user: defaultValues,
	loading: false,
	setUser() {},
	removeUser() {},
	async getUser() {
		return null;
	}
});

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User>(defaultValues);
	const [loading, setLoading] = useState(true);
	const [getArConnect, isArConnectLoading] = useArConnect();

	const removeUser = useCallback(() => setUser(defaultValues), []);

	const getUser = useCallback(async () => {
		setLoading(true);
		// Fetch Currently authenticated User by referring to their connect wallet.
		let arweaveWalletAddress;
		const arconnect = getArConnect();
		try {
			arweaveWalletAddress = await arconnect.getActiveAddress();
		} catch (e) {
			// ...
		}
		await Authenticate.withArConnect(arweaveWalletAddress, arconnect);

		const u = auth.user();
		console.log("getUser: ", u);
		if (!isEmpty(u) && u !== null) {
			if (u.role === "authenticated") {
				// Here we fetch user verifications
				const profile = await getProfile();
				const captcha = await checkCaptcha();
				const checkedUser = { ...u, profile, verifications: { captcha } };
				setUser(checkedUser);
				setErrorTrackingUser(checkedUser);
				identifyUser(checkedUser);
				return checkedUser;
			}
		}
		return null;
	}, []);

	const signIn = useCallback(
		async (options: SignInOptions) => {
			setLoading(true);
			const r = await authorise(options);
			setLoading(false);
			return r;
		},
		[user]
	);

	const signOut = useCallback(async () => {
		setLoading(true);
		const r = await auth.signOut();
		setLoading(false);
		return r;
	}, []);

	useAuthStateChange((event: string) => {
		switch (event) {
			case "SIGNED_IN": {
				// Fetch user on sign in
				getUser().finally(() => {
					setLoading(false);
				});
				break;
			}
			case "SIGNED_OUT": {
				(async () => {
					await delay(1000);
					window.location.reload();
				})();
				break;
			}
			default: {
				break;
			}
		}
	});

	// On render, fetch user from session
	let interval: NodeJS.Timer;
	useEffect(() => {
		if (user) {
			if (user.id) {
				clearInterval(interval);
				setLoading(false);
				return () => {};
			}
		}
		//* Because the system uses OTP -- this is the only point where the User State is set.
		(async () => {
			// Fetch user on an interval
			interval = setInterval(async () => {
				const respUser = await getUser();
				if (respUser !== null && !isEmpty(respUser)) {
					if (respUser.id) {
						clearInterval(interval);
						setLoading(false);
					}
				}
			}, 500);
			// Clear the interval after two seconds -- will ensure that the authorised should always be fetched regardless of if supabase event fires.
			await delay(2000);
			clearInterval(interval);
			setLoading(false);
		})();
		return () => {};
	}, [user]);

	const value = useMemo(
		() => ({
			user,
			loading,
			setUser,
			removeUser,
			getUser,
			signIn,
			signOut
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
