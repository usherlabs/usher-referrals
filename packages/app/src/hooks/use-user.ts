import { useContext } from "react";

import { UserContext } from "@/providers/User";
import getActiveWallet from "@/utils/get-active-wallet";

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
		wallet: getActiveWallet(user.wallets),
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
