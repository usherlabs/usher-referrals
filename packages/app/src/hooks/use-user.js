import isEmpty from "lodash/isEmpty";
import { useEffect, useContext, useCallback } from "react";

import { UserContext } from "@/providers/User";
import { WalletContext } from "@/providers/Wallet";
import { supabase } from "@/utils/supabase-client";
import events from "@/utils/events";
import saveWallet from "@/actions/save-wallet";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";

// Register the event emitter
supabase.auth.onAuthStateChange((event, session) => {
	events.emit(event, session);
});

function useUser() {
	const { user, removeUser, getUser, loading, setUser } =
		useContext(UserContext);
	const { address } = useContext(WalletContext);

	// Create a function that changes based on dependent variables
	const onSignIn = useCallback(
		(session) => {
			// Set SignedIn User to State.
			const u = session.user;
			if (isEmpty(u)) {
				return;
			}
			if (u.role !== "authenticated") {
				return;
			}

			setUser(u);

			try {
				// console.log(u, address);
				saveWallet(u, address);
			} catch (error) {
				handleException(error);
				alerts.error();
			}
		},
		[address]
	);

	const onSignOut = useCallback(() => {
		removeUser();
	}, []);

	// Initiate user on intial render
	useEffect(() => {
		// Listen for auth state change on initial mount
		events.on("SIGNED_IN", onSignIn);
		events.on("SIGNED_OUT", onSignOut);

		const onDismount = () => {
			events.off("SIGN_IN", onSignIn);
			events.off("SIGNED_OUT", onSignOut);
		};

		// If user already fetched -- ie fetched from SSR
		if (!loading && !isEmpty(user)) {
			return onDismount;
		}

		// This will be responsible for setting user to state if already authorised.
		getUser();

		return onDismount;
	}, []);

	return [user, loading, { removeUser, getUser, setUser }];
}

export default useUser;
