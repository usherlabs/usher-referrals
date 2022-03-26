import { setCookie } from "nookies";
import { supabase } from "@/utils/supabase-client";

import handleException from "@/utils/handle-exception";
import { CONVERSION_COOKIE_NAME } from "@/constants";
import { isEmpty } from "lodash";

const Invite = () => null;

/**
 * 1. Create a pending conversion
 * 2. Store that conversion id in the cookie
 * 3. Redirect to Advertiser Affiliate Referral URL
 *
 * @return  {Object}  props
 */
export async function getServerSideProps(ctx) {
	const {
		res,
		query: { id: inviteLinkId }
	} = ctx;

	// Check to make sure that the wallet/user_id combination exists
	const sSel = await supabase
		.from("invite_links")
		.select("destination_url")
		.eq("id", inviteLinkId);
	if ((sSel.error && sSel.status !== 406) || isEmpty(sSel.data)) {
		res.writeHead(302, {
			Location: `/link-error`
		});
		res.end();
		return { props: {} };
	}

	console.log(sSel);

	const [{ destination_url: url }] = sSel.data;

	const sIns = await supabase
		.from("conversions")
		.insert([{ invite_link_id: inviteLinkId }]);
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

	setCookie(ctx, CONVERSION_COOKIE_NAME, convId, {
		maxAge: 30 * 60 * 60, // lasts 30 days -- //* This can be configured ...eventually.
		path: "/satellite"
	});

	res.writeHead(302, {
		Location: url || `/link-error`
	});
	res.end();

	return { props: {} };
}

export default Invite;
