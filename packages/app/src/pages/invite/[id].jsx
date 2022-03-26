import { setCookie, parseCookies } from "nookies";
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
 * ! BUG: For some reason, parseCookies(ctx) returns nothing. ctx.req.headers.cookies returns nothing too despite the Cookies loading on the client.
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
		.select("destination_url, hits")
		.eq("id", inviteLinkId);
	if ((sSel.error && sSel.status !== 406) || isEmpty(sSel.data)) {
		res.writeHead(302, {
			Location: `/link-error`
		});
		res.end();
		return { props: {} };
	}

	console.log(sSel);

	const [{ destination_url: url, hits }] = sSel.data;

	// Check if a converison id already exists in cookies.
	const cookies = parseCookies(ctx);
	console.log(ctx.req.headers);
	console.log("cookies", cookies);
	let convId = cookies[CONVERSION_COOKIE_NAME];
	if (!isEmpty(convId)) {
		// Check if conversion is still available for completion
		const sConvSel = await supabase
			.from("conversions")
			.select("id, is_complete, is_bundled")
			.eq("id", convId);
		if (sConvSel.error && sConvSel.status !== 406) {
			handleException(sConvSel.error);
			convId = ""; // Empty convId
		} else if (!isEmpty(sConvSel.data)) {
			if (sConvSel.data.length > 1) {
				handleException(
					new Error(`More than one Conversion exists for ID: ${convId}`)
				);
			}
			const [convData] = sConvSel.data;
			if (convData.is_complete === true || convData.is_bundled === true) {
				// If conv is no longer available...
				convId = ""; // Empty convId
			}
		}
	}

	if (isEmpty(convId)) {
		// Insert new conversion if no conversion exists
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

		[{ id: convId }] = sIns.data;
	}

	// Track Link Hit
	const sLinkUpd = await supabase
		.from("invite_links")
		.update({ hits: hits + 1 })
		.match({ id: inviteLinkId });
	if (sLinkUpd.error && sLinkUpd.status !== 406) {
		handleException(sLinkUpd.error);
	}

	// If a conversion already exists -- this link will extend it.
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
