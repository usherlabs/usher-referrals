import { Usher } from "usher-js";
import { parseCookies } from "nookies";
import isEmpty from "lodash/isEmpty";

import { supabase } from "@/utils/supabase-client";
import { advertiser } from "@/env-config";
import { CONVERSION_COOKIE_NAME } from "@/constants";

export const convertUser = async (userId, address, linkId) => {
	// Check if the Link ID for the given converison id matches the current user's link id
	const cookies = parseCookies();
	const cid = cookies[CONVERSION_COOKIE_NAME];
	console.log(cid);
	if (!cid) {
		return false;
	}
	const sSel = await supabase
		.from("conversions")
		.select("invite_link_id")
		.eq("id", cid)
		.limit(1);
	if (sSel.error && sSel.status !== 406) {
		throw sSel.error;
	}
	if (isEmpty(sSel.data)) {
		return false;
	}
	console.log("convert-user", sSel.data);
	const [{ invite_link_id: linkIdFromConv }] = sSel.data;
	if (linkIdFromConv === linkId) {
		return false;
	}
	const eventPayload = {
		id: advertiser.usherContractAddress,
		nativeId: userId,
		properties: {
			walletAddress: address
		}
	};
	console.log(eventPayload);
	Usher("event", eventPayload);
	return true;
};
