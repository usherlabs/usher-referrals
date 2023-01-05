import { useContext } from "react";

import { UserContext } from "@/providers/User";

function useUser() {
	const {
		auth,
		user,
		loading,
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
