import { useCallback, useEffect, useState } from "react";
import { setCookie } from "nookies";
import isEmpty from "lodash/isEmpty";
import { Pane } from "evergreen-ui";
import Botd from "@fpjs-incubator/botd-agent";
import PropTypes from "prop-types";
import Image from "next/image";

import { supabase } from "@/utils/supabase-client";
import handleException from "@/utils/handle-exception";
import { CONVERSION_COOKIE_NAME } from "@/constants";
import { botdPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";
import { checkBotDetect, submitCaptcha } from "@/actions/bot";
import Captcha from "@/components/Captcha";

import LogoImage from "@/assets/logo/Logo.png";

const Invite = ({ url }) => {
	const [showCaptcha, setShowCaptcha] = useState(false);

	useEffect(() => {
		(async () => {
			// Initialize an agent at application startup.
			const botd = await Botd.load({ publicKey: botdPublicKey });

			// Get the visitor identifier when you need it.
			const { requestId } = await botd.detect();
			const result = await checkBotDetect(requestId);
			if (!result) {
				setShowCaptcha(true);
				return;
			}

			window.location.replace(url);
		})();
	}, []);

	const onCaptchaSuccess = useCallback(async (token) => {
		console.log(token);
		const isSuccess = await submitCaptcha(token);
		if (isSuccess) {
			window.location.replace(url);
		}
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
			{showCaptcha ? (
				<Captcha onSuccess={onCaptchaSuccess} />
			) : (
				<Preloader message={`You've been invited...`} />
			)}
			<Pane
				zIndex={100}
				position="fixed"
				bottom={20}
				left={0}
				right={0}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Image src={LogoImage} width={150} objectFit="contain" />
			</Pane>
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
