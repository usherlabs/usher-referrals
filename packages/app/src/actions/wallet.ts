import isEmpty from "lodash/isEmpty";
import ono from "@jsdevtools/ono";

import { User } from "@/types";
import { supabase } from "@/utils/supabase-client";
import { SKIPPED_WALLET_ADDRESS } from "@/constants";

export const saveWallet = async (user: User, address: string) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const sSel = await supabase
		.from("wallets")
		.select(`id`)
		.eq("address", address)
		.order("created_at", { ascending: false });
	if (sSel.error && sSel.status !== 406) {
		throw ono(sSel.error, "wallets");
	}
	console.log("wallets: select", sSel);

	if (!isEmpty(sSel.data)) {
		return (sSel.data || [])[0];
	}

	const sIns = await supabase
		.from("wallets")
		.insert({ address, user_id: user.id });
	console.log("wallets: insert", sIns);
	if (sIns.error && sIns.status !== 406) {
		throw ono(sIns.error, "wallets");
	}
	if (!isEmpty(sIns.data)) {
		return (sIns.data || [])[0];
	}
	return {};
};

export const getSkippedWallet = async (user: User) => {
	const sSel = await supabase
		.from("wallets")
		.select(`id, address`)
		.match({ address: SKIPPED_WALLET_ADDRESS, user_id: user.id })
		.order("created_at", { ascending: false });
	if (sSel.error && sSel.status !== 406) {
		throw ono(sSel.error, "skipped wallets");
	}
	console.log("skipped wallets: select", sSel);
	if (!isEmpty(sSel.data)) {
		return (sSel.data || [])[0];
	}
	return {};
};
