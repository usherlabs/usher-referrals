import { setCookie } from "nookies";
import { supabase } from "@/utils/supabase-client";

import handleException from "@/utils/handle-exception";
import { advertiser } from "@/env-config";
import { isEmpty } from "lodash";

const Invite = () => null;

/**
 * 1. Create a pending conversion
 * 2. Store that conversion id in the cookie
 * 3. Redirect to Advertiser Affiliate Referral URL
 *
 * @return  {Object}  props
 */
export async function getServerSideProps({ res, query: { id: userId } }) {
	// Check to make sure user_id exists
	const sSel = await supabase
		.from("wallets")
		.select("id", { count: "exact", head: true })
		.eq("user_id", userId);
	console.log(sSel);
	if ((sSel.error && sSel.status !== 406) || isEmpty(sSel.data)) {
		res.writeHead(302, {
			Location: `/link-error`
		});
	}

	const sIns = await supabase.from("conversions").insert([{ user_id: userId }]);
	if (sIns.error && sIns.status !== 406) {
		handleException(sIns.error);
		res.writeHead(302, {
			Location: `/link-error`
		});
	}

	console.log(sIns);

	// const { id } = sIns.data;

	// setCookie({ req, res }, "__usher_cid", id, {
	// 	maxAge: 7 * 60 * 60, // lasts 7 days
	// 	path: "/satellite"
	// });

	// res.writeHead(302, {
	// 	Location: advertiser.affiliateRedirectUrl
	// });

	res.end();

	return { props: {} };
}

export default Invite;
