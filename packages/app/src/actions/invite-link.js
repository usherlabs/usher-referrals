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

	let [data] = sSel.data;

	if (isEmpty(data)) {
		const sIns = await supabase.from("invite_links").insert({
			wallet_id: walletId,
			destination_url: advertiser.destinationUrl
		});
		console.log("invite_links: insert", sIns);
		if (sIns.error && sIns.status !== 406) {
			throw sIns.error;
		}
		[data] = sIns.data;
	}

	let hits = 0;
	if (!isEmpty(data)) {
		// This isn't returning anything... but also not throwing...
		const sConvCountSel = await supabase
			.from("conversions")
			.select("id", { count: "exact", head: true })
			.eq("invite_link_id", data.id);
		console.log("conversions: select|count", sConvCountSel, data.id);
		if (sConvCountSel.error && sConvCountSel.status !== 406) {
			throw sConvCountSel.error;
		}
		hits = sConvCountSel.count || 0;
	}

	return [data, hits];
};

export default saveInviteLink;
