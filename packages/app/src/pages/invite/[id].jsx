import { useEffect, useState } from "react";
import { setCookie } from "nookies";
import isEmpty from "lodash/isEmpty";
import { Pane } from "evergreen-ui";
// import FingerprintJS from "@fingerprintjs/fingerprintjs-pro";
import Botd from "@fpjs-incubator/botd-agent";
import PropTypes from "prop-types";

import { supabase } from "@/utils/supabase-client";
import handleException from "@/utils/handle-exception";
import { CONVERSION_COOKIE_NAME } from "@/constants";
import { fingerprint } from "@/env-config";
import Preloader from "@/components/Preloader";

// pP2EEs2tey9HliQd45m0EmXQ

const Invite = ({ url }) => {
	const [showCaptcha, setShowCaptcha] = useState(false);

	useEffect(() => {
		(async () => {
			// Initialize an agent at application startup.
			// const fp = await FingerprintJS.load(fingerprint);
			const botd = await Botd.load({ publicKey: "Q6fKMRWM0H78YDm63as236SM" });

			// Get the visitor identifier when you need it.
			// const result = await fp.get();
			const result = await botd.detect();
			console.log(result);

			// window.location.href = url;
			console.log(url);
		})();
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			<Preloader message={`You've been invited...`} />
		</Pane>
	);
};

Invite.propTypes = {
	url: PropTypes.string.isRequired
};

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

	return { props: { success: true, url } };
}

export default Invite;
