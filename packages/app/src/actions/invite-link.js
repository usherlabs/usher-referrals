import isEmpty from "lodash/isEmpty";

import { supabase } from "@/utils/supabase-client";
import { advertiser } from "@/env-config";

// Debounce to minise duplicate API calls.
const saveInviteLink = async (walletId) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const sSel = await supabase
		.from("invite_links")
		.select(`id`)
		.eq("wallet_id", walletId);
	if (sSel.error && sSel.status !== 406) {
		throw sSel.error;
	}
	console.log("invite_links: select", sSel);

	if (!isEmpty(sSel.data)) {
		return sSel.data[0];
	}

	const sIns = await supabase.from("invite_links").insert({
		wallet_id: walletId,
		destination_url: advertiser.destinationUrl
	});
	console.log("invite_links: insert", sIns);
	if (sIns.error && sIns.status !== 406) {
		throw sIns.error;
	}
	if (!isEmpty(sIns.data)) {
		return sIns.data[0];
	}
	return {};
};

export default saveInviteLink;
