import { useContext, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
// import { supabase } from "@/utils/supabase-client";

import { UserContext } from "@/providers/User";
import { identifyUser } from "@/utils/signals";
import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import useAuthStateChange from "./use-auth-state-change";

function useUser() {
	const { user, loading, removeUser, getUser, setUser, signIn, signOut } =
		useContext(UserContext);

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

	return [
		user,
		loading,
		{
			removeUser,
			getUser,
			setUser,
			signIn,
			signOut
		}
	];
}

export default useUser;
