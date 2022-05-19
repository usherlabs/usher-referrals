import { useContext } from "react";

import { Connections, Wallet } from "@/types";
import { UserContext } from "@/providers/User";

const defaultWallet: Wallet = {
	chains: [],
	connection: Connections.ARCONNECT,
	address: "",
	active: false
};

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
		wallet: user.wallets.find(({ active }) => !!active) || defaultWallet,
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
