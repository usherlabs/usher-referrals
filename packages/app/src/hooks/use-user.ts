import { useContext } from "react";

import { UserContext } from "@/providers/User";

function useUser() {
	const { user, loading, removeUser, getUser, setUser, signIn, signOut } =
		useContext(UserContext);

	return {
		user,
		isLoading: loading,
		actions: {
			removeUser,
			getUser,
			setUser,
			signIn,
			signOut
		}
	};
}

export default useUser;
