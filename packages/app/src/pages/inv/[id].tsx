import { useCallback, useEffect, useState } from "react";
import { setCookie, parseCookies } from "nookies";
import { Pane } from "evergreen-ui";
import Botd from "@fpjs-incubator/botd-agent";
import Image from "next/image";
import { useRouter } from "next/router";
import { TileLoader } from "@glazed/tile-loader";
import { isEmpty } from "lodash";
import ono from "@jsdevtools/ono";
import { Base64 } from "js-base64";

import { ceramic } from "@/utils/ceramic-client";
import { CONVERSION_COOKIE_NAME, NETWORK_DID } from "@/constants";
import { botdPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";
import Captcha from "@/components/Captcha";
import * as api from "@/api";
import handleException from "@/utils/handle-exception";
import LogoImage from "@/assets/logo/Logo.png";
import { CampaignReference } from "@/types";

const loader = new TileLoader({ ceramic });

const onError = () => window.location.replace(`/link-error`);

const Invite = () => {
	const [showCaptcha, setShowCaptcha] = useState(false);
	const router = useRouter();
	const { id } = router.query;
	// const [{ inviteConflictStrategy }, isContractLoading] = useContract(); // TODO: Pass in the id here to determine the correct Contract to fetch

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

		const cookies = parseCookies();
		const token = cookies[CONVERSION_COOKIE_NAME];

		// TODO: Decrypt this token to determine if it's related.
		// let isExistingConvIdRelated = false;
		// if (cid) {
		// 	try {
		// 		const dec = JSON.parse(Base64.decode(token)) as Conversion;
		// 		dec.token;
		// 	} catch (e) {
		// 		// ...
		// 	}
		// }

		const referral = api.referrals().post({
			token
		});

		const {
			success,
			convId: existingConvId,
			isRelated // Determines whether the existing ConvID is related to the Invite Link Id
		} = await getDestinationUrl(id, cid);

		if (!success) {
			onError();
			return;
		}

		// If the Smart Contract has NOT defined that new Affiliate Links will overwrite the conversion
		// The default behaviour is to simply skip replacing the conversion cookie if a valid one exists
		if (
			inviteConflictStrategy === CONTRACT_INVITE_CONFLICT_STRATEGY.OVERWRITE ||
			!existingConvId
		) {
			// If a valid converison tracking id is NOT already in cookie
			const { convId } = await createConversion(id);
			if (convId) {
				setCookie(null, CONVERSION_COOKIE_NAME, convId, {
					maxAge: 30 * 60 * 60, // lasts 30 days -- //* This can be configured ...eventually.
					path: "/"
				});
			}
		} else if (existingConvId && isRelated) {
			// Extend the duration of the Cookie if the Invite Link ID is related to the Conversion ID in the Cookie
			setCookie(null, CONVERSION_COOKIE_NAME, existingConvId, {
				maxAge: 30 * 60 * 60, // lasts 30 days -- //* This can be configured ...eventually.
				path: "/"
			});
		}

		// Redirect to Advertiser Affiliate Referral URL
		window.location.replace(url);
	}, [id]);

	const onCaptchaSuccess = useCallback(
		async (token: string) => {
			// console.log(token);
			const { success: isSuccess } = await api.captcha().post(token);
			if (isSuccess) {
				processInvite();
			}
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
			{!isContractLoading && showCaptcha ? (
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

export const getStaticProps = async () => {
	return {
		props: {
			noUser: true
		}
	};
};

export default Invite;
