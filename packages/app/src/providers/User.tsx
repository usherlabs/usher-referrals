import isEmpty from "lodash/isEmpty";
import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";

import { User } from "@/types";
import { authorise, checkCaptcha } from "@/actions/user";
import useAuthStateChange from "@/hooks/use-auth-state-change";
import delay from "@/utils/delay";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
import { supabase } from "@/utils/supabase-client";

type Props = {
	children: React.ReactNode;
};
type ContextType = {
	user: User | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	removeUser: () => void;
	getUser: () => Promise<User | null>;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
};

export const UserContext = createContext<ContextType>({
	user: null,
	loading: false,
	setUser() {},
	removeUser() {},
	async getUser() {
		return null;
	},
	async signIn() {
		return undefined;
	},
	async signOut() {
		return undefined;
	}
});

const UserContextProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const removeUser = useCallback(() => setUser(null), []);

	const getUser = useCallback(async () => {
		setLoading(true);
		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		console.log("getUser: ", u);
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				// Here we fetch user verifications
				const captcha = await checkCaptcha(u);
				const checkedUser = { ...u, verifications: { captcha } };
				setUser(checkedUser);
				setErrorTrackingUser(checkedUser);
				identifyUser(checkedUser);
				return checkedUser;
			}
		}
		return {};
	}, []);

	const signIn = useCallback(
		async (options = {}) => {
			setLoading(true);
			const r = await authorise(options);
			setLoading(false);
			return r;
		},
		[user]
	);

	const signOut = useCallback(async () => {
		setLoading(true);
		const r = await supabase.auth.signOut();
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
				if (respUser.id) {
					clearInterval(interval);
					setLoading(false);
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
