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
export async function getServerSideProps({ req, res, query: { id } }) {
	// Check to make sure that the wallet/user_id combination exists
	const sSel = await supabase.from("wallets").select("user_id").eq("id", id);
	if ((sSel.error && sSel.status !== 406) || isEmpty(sSel.data)) {
		res.writeHead(302, {
			Location: `/link-error`
		});
		res.end();
		return { props: {} };
	}

	const [{ user_id: userId }] = sSel.data;

	const sIns = await supabase.from("conversions").insert([{ user_id: userId }]);
	if ((sIns.error && sIns.status !== 406) || isEmpty(sIns.data)) {
		handleException(sIns.error);
		res.writeHead(302, {
			Location: `/link-error`
		});
		res.end();
		return { props: {} };
	}

	console.log(sIns);

	const [{ id: convId }] = sIns.data;

	setCookie({ req, res }, "__usher_cid", convId, {
		maxAge: 30 * 60 * 60, // lasts 30 days
		path: "/satellite"
	});

	res.writeHead(302, {
		Location: advertiser.affiliateRedirectUrl || `/link-error`
	});
	res.end();

	return { props: {} };
}

export default Invite;
