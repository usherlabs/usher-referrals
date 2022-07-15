import { useCallback, useEffect, useState } from "react";
import { Pane } from "evergreen-ui";
import Botd from "@fpjs-incubator/botd-agent";
import Image from "next/image";
import { useRouter } from "next/router";
import { TileLoader } from "@glazed/tile-loader";
import { isEmpty } from "lodash";
import ono from "@jsdevtools/ono";
import { ShareableOwnerModel } from "@usher/ceramic";
import { Base64 } from "js-base64";

import { ceramic } from "@/utils/ceramic-client";
import { botdPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";
import Captcha from "@/components/Captcha";
import * as api from "@/api";
import handleException from "@/utils/handle-exception";
import LogoImage from "@/assets/logo/Logo.png";
import { CampaignReference, Referral, CampaignConflictStrategy } from "@/types";
import getReferralTokenKey from "@/utils/get-referral-token-key";

const loader = new TileLoader({ ceramic });

const onError = () => {
	// window.location.replace(`/link-error`)
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

		//* The reason we're splitting keys per campaign is to ensure that each key respects it's own duration.
		const tokenKey = getReferralTokenKey(campaign.id, campaign.chain);

		// Flush expired keys before proceed with key fetch and set.
		// lscache.flushExpired();

		let existingToken;
		// If the campaign conflict strategy is to NOT always overwrite the referral, then check for an existing token
		if (campaign.conflictStrategy !== CampaignConflictStrategy.OVERWRITE) {
			// const lsToken = lscache.get(tokenKey);
			const lsToken = window.localStorage.getItem(tokenKey);
			if (lsToken) {
				existingToken = lsToken;
			}
		}

		try {
			const referral: { success: boolean; data: Referral } = await api
				.referrals()
				.post(id, existingToken);

			if (!referral.success) {
				onError();
				return;
			}

			// If the Terms have NOT defined that new Invite Links will overwrite the conversion
			// The default behaviour is to extend the token expiry if a valid one exists
			const invitingParam = {
				key: tokenKey,
				value: referral.data.token,
				url: campaign.details.destinationUrl
			};
			const encParam = Base64.encodeURI(JSON.stringify(invitingParam));
			const redirectURI = `/satellite?param=${encParam}`;
			console.log({
				invitingParam,
				redirectURI: `${window.location.origin}${redirectURI}`
			});
		} catch (e) {
			handleException(e);
		}

		// Redirect to Advertiser Campaign Destination URL
		// window.location.replace(campaign.details.destinationUrl);
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
