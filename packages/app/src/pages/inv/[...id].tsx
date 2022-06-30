import { useCallback, useEffect, useState } from "react";
import { setCookie, parseCookies } from "nookies";
import { Pane } from "evergreen-ui";
import Botd from "@fpjs-incubator/botd-agent";
import Image from "next/image";
import { useRouter } from "next/router";
import { TileLoader } from "@glazed/tile-loader";
import { isEmpty } from "lodash";
import ono from "@jsdevtools/ono";
import { ShareableOwnerModel } from "@usher/ceramic";

import { ceramic } from "@/utils/ceramic-client";
import { CONVERSION_COOKIE_NAME } from "@/constants";
import { botdPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";
import Captcha from "@/components/Captcha";
import * as api from "@/api";
import handleException from "@/utils/handle-exception";
import LogoImage from "@/assets/logo/Logo.png";
import { CampaignReference, Referral, CampaignConflictStrategy } from "@/types";

const loader = new TileLoader({ ceramic });

const onError = () => window.location.replace(`/link-error`);

// TODO: TEST THIS PAGE -- and subsequent processes.
const Invite = () => {
	const [showCaptcha, setShowCaptcha] = useState(false);
	const router = useRouter();
	const { id } = router.query;
	console.log("id", id);

	const processInvite = useCallback(async () => {
		// Start by fetching the campaign data for the given campaign
		const partnershipId = id as string;
		if (!partnershipId) {
			handleException(
				ono("Invite being processed when there is no partnershipId")
			);
			onError();
			return;
		}

		const partnershipStream = await loader.load(partnershipId);
		if (
			!(
				partnershipStream.content.address &&
				partnershipStream.content.chain &&
				partnershipStream.controllers.length > 0 &&
				partnershipStream.metadata.schema ===
					ShareableOwnerModel.schemas.partnership
			)
		) {
			handleException(
				ono("Partnership is invalid", {
					partnershipId
				})
			);
			onError();
		}

		const campaignRef = partnershipStream.content as CampaignReference;

		const campaigns = await api.campaigns().get([campaignRef]);

		if (campaigns.success === false || isEmpty(campaigns.data)) {
			handleException(
				ono("No campaign loaded for the partnership", {
					partnershipId,
					campaigns
				})
			);
			onError();
			return;
		}

		const campaign = campaigns.data[0];

		const { destinationUrl } = campaign.details;

		let existingToken;
		// If the campaign conflict strategy is to NOT always overwrite the referral, then check for an existing token
		if (campaign.conflictStrategy !== CampaignConflictStrategy.OVERWRITE) {
			const cookies = parseCookies();
			existingToken = cookies[CONVERSION_COOKIE_NAME] as string;
		}

		const referral: { success: boolean; data: Referral } = await api
			.referrals()
			.post(id as string, existingToken);

		if (!referral.success) {
			onError();
			return;
		}

		// If the Terms have NOT defined that new Affiliate Links will overwrite the conversion
		// The default behaviour is to simply skip replacing the conversion cookie if a valid one exists
		setCookie(null, CONVERSION_COOKIE_NAME, referral.data.token, {
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: "/"
		});

		// Redirect to Advertiser Affiliate Referral URL
		window.location.replace(destinationUrl);
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
			// Initialize an agent at application startup.
			const botd = await Botd.load({ publicKey: botdPublicKey });

			// Get the visitor identifier when you need it.
			const { requestId } = (await botd.detect()) as { requestId: string };

			const result = await api.bot().post(requestId);
			if (!result.success) {
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
				<Image src={LogoImage} width={150} objectFit="contain" />
			</Pane>
		</Pane>
	);
};

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default Invite;
