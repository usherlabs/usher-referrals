import { useContext } from "react";

import { UserContext } from "@/providers/user/User";

function useUser() {
	const {
		auth,
		user,
		loading,
		isAuthenticated,
		connect,
		disconnect,
		setCaptcha,
		setPersonhood,
		setProfile,
		addPartnership
	} = useContext(UserContext);

	return {
		auth,
		user,
		isLoading: loading,
		isAuthenticated,
		actions: {
			connect,
			disconnect,
			setCaptcha,
			setPersonhood,
			setProfile,
			addPartnership
		}
	};
}

export default useUser;
