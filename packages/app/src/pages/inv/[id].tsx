import { useCallback, useEffect, useState } from "react";
import { Pane } from "evergreen-ui";
import Botd from "@fpjs-incubator/botd-agent";
import Image from "next/image";
import { useRouter } from "next/router";
import ono from "@jsdevtools/ono";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

import { botdPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";
import Captcha from "@/components/Captcha";
import * as api from "@/api";
import handleException from "@/utils/handle-exception";
import LogoImage from "@/assets/logo/Logo.png";
import { events, AppEvents } from "@/utils/events";

const onError = () => {
	window.location.replace(`/link-error`);
};

type Props = {
	id: string;
};

const Invite: React.FC<Props> = () => {
	const [showCaptcha, setShowCaptcha] = useState(false);
	const router = useRouter();
	const id = router.query.id as string;

	const processInvite = useCallback(async () => {
		// Start by fetching the campaign data for the given campaign
		const partnershipId = id;
		if (!partnershipId) {
			handleException(
				ono("Invite being processed when there is no partnershipId")
			);
			onError();
			return;
		}

		try {
			const referral = await api.referrals().post(id);

			if (!referral.success || !referral.data) {
				onError();
				return;
			}

			let visitorId = "";
			let visitorComponents = {};
			const fp = await FingerprintJS.load({
				monitoring: false
			});
			const fpRes = await fp.get();
			visitorId = fpRes.visitorId;
			visitorComponents = fpRes.components;

			events.emit(AppEvents.REFERRAL, {
				partnership: partnershipId,
				token: referral.data.token,
				visitorId,
				visitorComponents
			});

			// Redirect to Advertiser Campaign Destination URL
			window.location.replace(referral.data.url);
		} catch (e) {
			handleException(e);
			onError();
		}
	}, [id]);

	const onCaptchaSuccess = useCallback(
		async (token: string) => {
			// console.log(token);
			const { success: isSuccess } = await api.captcha().post(token);
			if (isSuccess) {
				processInvite();
				return true;
			}
			return false;
		},
		[id]
	);

	useEffect(() => {
		if (!id) {
			return () => {};
		}
		(async () => {
			let shouldCaptcha = false;
			try {
				// Initialize an agent at application startup.
				const botd = await Botd.load({ publicKey: botdPublicKey });

				// Get the visitor identifier when you need it.
				const { requestId } = (await botd.detect()) as { requestId: string };

				const result = await api.bot().post(requestId);

				shouldCaptcha = !result.success;
			} catch (e) {
				handleException(e);
				shouldCaptcha = true;
			}

			if (shouldCaptcha) {
				setShowCaptcha(true);
				return;
			}

			processInvite();
		})();
		return () => {};
	}, [id]);

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
				<Image src={LogoImage} width={120} objectFit="contain" />
			</Pane>
		</Pane>
	);
};

export async function getStaticPaths() {
	return {
		paths: [], // Generate not pages at build time
		fallback: true // If there's not page, load, generate the page, and then serve the generated page...
	};
}

export async function getStaticProps() {
	return {
		props: {
			noUser: true,
			seo: {
				title: "You've been invited...",
				description: `You are being redirected to the Brand's URL...`
			}
		}
	};
}

export default Invite;
