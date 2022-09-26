import * as api from "@/api";
import LogoImage from "@/assets/logo/Logo.png";
import Captcha from "@/components/Captcha";
import Preloader from "@/components/Preloader";
import WalletInvite from "@/components/WalletInvite";
import { botdPublicKey } from "@/env-config";
import { CampaignReference, Chains } from "@/types";
import { ceramic } from "@/utils/ceramic-client";
import { AppEvents, events } from "@/utils/events";
import handleException from "@/utils/handle-exception";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import Botd from "@fpjs-incubator/botd-agent";
import { TileLoader } from "@glazed/tile-loader";
import ono from "@jsdevtools/ono";
import { Pane } from "evergreen-ui";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const onError = () => {
	window.location.replace(`/link-error`);
};

type Props = {
	id: string;
	domain: string;
	isWalletRequired: boolean;
	chain: Chains;
};

enum Step {
	Init,
	Captcha,
	Wallet,
	ProcessInvite
};

const Invite: React.FC<Props> = () => {
	const [step, setStep] = useState(Step.Init);

	const [chain, setChain] = useState<Chains>();
	const [domain, setDomain] = useState<string>();
	const [isWalletRequired, setIsWalletRequired] = useState<boolean>();

	const [wallet, setWallet] = useState<string>();

	const router = useRouter();
	const id = router.query.id as string;

	const isCaptchaNeeded = useCallback(
		async () => {
			try {
				// Initialize an agent at application startup.
				const botd = await Botd.load({ publicKey: botdPublicKey });

				// Get the visitor identifier when you need it.
				const { requestId } = (await botd.detect()) as { requestId: string };

				const result = await api.bot().post(requestId);
				return !result.success;
			} catch (e) {
				handleException(e);
				return true;
			}
		},
		[]
	);

	const nextStep = useCallback(
		async () => {
			// Check the current step and set a corresponding next step
			switch (step) {
				case Step.Init:
					if (await isCaptchaNeeded()) {
						setStep(Step.Captcha);
					} else if (isWalletRequired) {
						setStep(Step.Wallet)
					}
					break;
				case Step.Captcha:
					if (isWalletRequired) {
						setStep(Step.Wallet)
					} else {
						setStep(Step.ProcessInvite);
					}
					break;
				case Step.Wallet:
					setStep(Step.ProcessInvite);
					break;
				default:
					break;
			}
		},
		[step, isCaptchaNeeded, isWalletRequired]
	);

	const onCaptchaSuccess = useCallback(
		async (token: string) => {
			const { success: isSuccess } = await api.captcha().post(token);
			if (isSuccess) {
				await nextStep();
				return true;
			}
			return false;
		},
		[nextStep]
	);

	const onWalletConnect = useCallback(
		async (address: string, signature: string) => {
			console.log("onWalletConnect", {
				address, signature
			});

			setWallet([chain, address].join(":"));
			await nextStep();
			return true;
		},
		[nextStep]
	);

	const initialize = useCallback(
		async () => {
			const loader = new TileLoader({ ceramic });
			const stream = await loader.load<CampaignReference>(id);
			const campaignRef = stream.content;
			const { data: [campaign] } = await api.campaigns().get(campaignRef);

			setChain(campaign.chain);
			setDomain((new URL(campaign.details.destinationUrl)).hostname);
			setIsWalletRequired(campaign.events.some(e => e.contractAddress && e.contractEvent));
		},
		[]
	);

	const processInvite = useCallback(
		async () => {
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
				console.log("Sending API request", { id, wallet });

				const referral = await api.referrals().post(id, wallet);

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
		},
		[id, wallet]
	);

	useEffect(
		() => {
			const fn = async () => {
				if (step === Step.Init) {
					await initialize();
					await nextStep();
				} else if (step == Step.ProcessInvite) {
					processInvite();
				}
			};
			fn();
		},
		[step, initialize, processInvite,]
	);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{step === Step.Init &&
				<Preloader message={`You've been invited...`} />
			}
			{step === Step.Captcha &&
				<Captcha onSuccess={onCaptchaSuccess} />
			}
			{step === Step.Wallet &&
				<WalletInvite
					chain={chain as Chains}
					domain={domain as string}
					onConnect={onWalletConnect} />
			}
			{step === Step.ProcessInvite &&
				<Preloader message={`You've been invited...`} />
			}
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
