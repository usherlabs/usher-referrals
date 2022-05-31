import { useContext } from "react";

import { UserContext } from "@/providers/User";

function useUser() {
	const {
		user,
		loading,
		getUser,
		connect,
		disconnect,
		setCaptcha,
		setProfile,
		addPartnership
	} = useContext(UserContext);

	return {
		user,
		isLoading: loading,
		actions: {
			getUser,
			connect,
			disconnect,
			setCaptcha,
			setProfile,
			addPartnership
		}
	};
}

export default useUser;
