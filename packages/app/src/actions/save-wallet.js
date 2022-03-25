import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";

import { supabase } from "@/utils/supabase-client";
import { advertiser } from "@/env-config";
import joinDiscordGuild from "./join-discord";

// Debounce to minise duplicate API calls.
const saveWallet = debounce(async (user, address) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const sSel = await supabase
		.from("wallets")
		.select(`user_id, address, id`)
		.eq("address", address);
	if (sSel.error && sSel.status !== 406) {
		throw sSel.error;
	}

	if (isEmpty(sSel.data)) {
		const sWalletIns = await supabase
			.from("wallets")
			.insert({ address, user_id: user.id });
		// console.log(r);
		if (sWalletIns.error && sWalletIns.status !== 406) {
			throw sWalletIns.error;
		}
		console.log(sWalletIns);
		const sLinkIns = await supabase.from("invite_links").insert(
			{
				wallet_id: sWalletIns.data.id,
				destination_url: advertiser.destinationUrl
			},
			{
				returning: "minimal" // Don't return the value after inserting
			}
		);
		if (sLinkIns.error && sLinkIns.status !== 406) {
			throw sLinkIns.error;
		}
		console.log(sLinkIns);
		if (user.app_metadata?.provider === "discord") {
			await joinDiscordGuild(); // Join Discord Guild if new Wallet.
		}
	}
}, 500);

export default saveWallet;
