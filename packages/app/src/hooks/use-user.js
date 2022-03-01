import isEmpty from "lodash/isEmpty";
import { useEffect, useContext } from "react";

import { UserContext } from "@/providers/User";
import { supabase } from "@/utils/supabase-client";
import events from "@/utils/events";

function useUser() {
	const { user, removeUser, getUser, loading, setUser } =
		useContext(UserContext);

	// Initiate user on intial render
	useEffect(() => {
		// Listen for auth state change on initial mount
		supabase.auth.onAuthStateChange((event, session) => {
			switch (event) {
				case "SIGNED_IN": {
					// Set SignedIn User to State.
					const u = session.user;
					if (!isEmpty(u)) {
						if (u.role === "authenticated") {
							setUser(u);
							events.emit("SIGN_IN", u);
						}
					}
					break;
				}
				case "SIGNED_OUT": {
					removeUser();
					events.emit("SIGN_OUT");
					break;
				}
				default: {
					break;
				}
			}
		});

		// If user already fetched -- ie fetched from SSR
		if (!loading && !isEmpty(user)) {
			return () => {};
		}

		(async () => {
			// This will be responsible for setting user to state if already authorised.
			await getUser();
		})();

		return () => {};
	}, []);

	return [user, loading, { removeUser, getUser, setUser }];
}

export default useUser;
