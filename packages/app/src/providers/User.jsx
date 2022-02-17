import React, { createContext, useState, useEffect } from "react";
import isEmpty from "lodash/is-empty";
import get from "lodash/get";
import once from "lodash/once";
import PropTypes from "prop-types";

import * as routes from "@/routes";
import { identifyUser } from "@/utils/signals";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";

export const UserContext = createContext();

const getUserFromSSR = () => {
	if (typeof window === "undefined") {
		return null;
	}
	// If window is defined, retrieve user object from SSR directly. -- Hack but will work.
	return get(window, "__NEXT_DATA__.props.pageProps.user", null);
};

const UserContextProvider = ({ children }) => {
	const userFromSSR = getUserFromSSR();
	const [user, setUserState] = useState(() => userFromSSR);
	const [loading, setLoading] = useState(() => !userFromSSR);

	const setUser = (paramUser) => {
		if (isEmpty(paramUser)) {
			return null;
		}
		setUserState(paramUser);
		setErrorTrackingUser(paramUser);
		identifyUser(paramUser);
		return paramUser;
	};
	const removeUser = () => setUser({});
	const getUser = (cb) => {
		setLoading(true);
		request
			.get(routes.api.user)
			.then(({ data }) => data)
			.then((retrievedUser) => {
				setUser(retrievedUser);
				cb(retrievedUser);
			})
			.catch(() => {
				return null;
			})
			.finally(() => {
				setLoading(false);
			});
	};
	const getUserOnce = once(getUser);

	// If user sourced from SSR, apply to third party services
	useEffect(() => {
		if (!isEmpty(user)) {
			setErrorTrackingUser(user);
			identifyUser(user);
		}
	}, []);

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				removeUser,
				getUser,
				getUserOnce,
				loading
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

UserContextProvider.propTypes = {
	children: PropTypes.any
};

export default UserContextProvider;
