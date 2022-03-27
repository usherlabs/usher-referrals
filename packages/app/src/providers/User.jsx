import React, {
	createContext,
	useEffect,
	useState,
	useMemo,
	useCallback
} from "react";
import isEmpty from "lodash/isEmpty";

import { ChildrenProps } from "@/utils/common-prop-types";
import { supabase } from "@/utils/supabase-client";
import { identifyUser } from "@/utils/signals";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import useAuthStateChange from "@/hooks/use-auth-state-change";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(true);

	const removeUser = useCallback(() => setUser({}), []);

	const getUser = useCallback(() => {
		setLoading(true);
		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				// Here we fetch user verifications
				setUser(u);
				return u;
			}
		}
		setLoading(false);
		return {};
	}, []);

	const signIn = useCallback(
		async (options = {}) => {
			setLoading(true);
			const r = await supabase.auth.signIn(options);
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

	useAuthStateChange((event, session) => {
		switch (event) {
			case "SIGNED_IN": {
				// Set SignedIn User to State.
				const u = session.user;
				if (isEmpty(u)) {
					return;
				}
				if (u.role !== "authenticated") {
					return;
				}
				setErrorTrackingUser(u);
				identifyUser(u);
				break;
			}
			case "SIGNED_OUT": {
				window.location.reload();
				break;
			}
			default: {
				break;
			}
		}
	});

	// On render, fetch user from session
	useEffect(() => {
		getUser();
	}, []);

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

UserContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default UserContextProvider;
