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
		setProfile
	} = useContext(UserContext);

	return {
		user,
		isLoading: loading,
		actions: {
			getUser,
			connect,
			disconnect,
			setCaptcha,
			setProfile
		}
	};
}

export default useUser;
