import React, {
	createContext,
	useState,
	useEffect,
	useMemo,
	useCallback
} from "react";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
// import PropTypes from "prop-types";

import { ChildrenProps } from "@/utils/common-prop-types";
import { identifyUser } from "@/utils/signals";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { supabase } from "@/utils/supabase-client";

export const UserContext = createContext();

const getUserFromSSR = () => {
	if (typeof window === "undefined") {
		return {};
	}
	// If window is defined, retrieve user object from SSR directly. -- Hack but will work.
	return get(window, "__NEXT_DATA__.props.pageProps.user", {});
};

const UserContextProvider = ({ children }) => {
	const userFromSSR = getUserFromSSR();
	const [user, setUserState] = useState(() => userFromSSR);
	const [loading, setLoading] = useState(() => !userFromSSR);

	const setUser = useCallback((paramUser) => {
		if (typeof paramUser !== "object") {
			return {};
		}
		setUserState(paramUser);
		setErrorTrackingUser(paramUser);
		identifyUser(paramUser);
		return paramUser;
	}, []);

	const removeUser = useCallback(() => setUser({}), []);

	const getUser = useCallback(() => {
		setLoading(true);
		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				console.log(u); //! DEV
				setUser(u);
				return u;
			}
		}
		setLoading(false);
		return {};
	}, []);

	// If user sourced from SSR, apply to third party services
	useEffect(() => {
		if (!isEmpty(user)) {
			setErrorTrackingUser(user);
			identifyUser(user);
		}
	}, []);

	const value = useMemo(
		() => ({
			user,
			loading,
			setUser,
			removeUser,
			getUser
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default UserContextProvider;
