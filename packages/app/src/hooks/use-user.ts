import { useContext } from "react";

import { UserContext } from "@/providers/User";

function useUser() {
	const {
		user,
		loading,
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
			connect,
			disconnect,
			setCaptcha,
			setProfile,
			addPartnership
		}
	};
}

export default useUser;
