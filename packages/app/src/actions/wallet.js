import isEmpty from "lodash/isEmpty";

import { supabase } from "@/utils/supabase-client";

const saveWallet = async (user, address) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const sSel = await supabase
		.from("wallets")
		.select(`id`)
		.eq("address", address);
	if (sSel.error && sSel.status !== 406) {
		throw sSel.error;
	}
	console.log("wallets: select", sSel);

	if (!isEmpty(sSel.data)) {
		return sSel.data[0];
	}

	const sIns = await supabase
		.from("wallets")
		.insert({ address, user_id: user.id });
	console.log("wallets: insert", sIns);
	if (sIns.error && sIns.status !== 406) {
		throw sIns.error;
	}
	if (!isEmpty(sIns.data)) {
		return sIns.data[0];
	}
	return {};
};

export default saveWallet;
