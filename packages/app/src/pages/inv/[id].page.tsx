/* eslint-disable @typescript-eslint/no-shadow */
import * as api from "@/api";
import Captcha from "@/components/Captcha";
import Preloader from "@/components/Preloader";
import WalletInvite, { WalletInviteProps } from "@/components/WalletInvite";
import { botdPublicKey } from "@/env-config";
import { Chains, Connections } from "@usher.so/shared";
import { CampaignReference } from "@usher.so/partnerships";
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
import { Campaigns } from "@usher.so/campaigns";
import { API_OPTIONS } from "@/constants";
import { BrandLogoDark } from "@/brand/logo-components/BrandLogos";

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
	Start,
	CaptchaCheck,
	Wallet,
	ProcessInvite
}

const campaignsProvider = new Campaigns(API_OPTIONS);

const Invite: React.FC<Props> = () => {
	const [step, setStep] = useState(Step.Init);

	const [chain, setChain] = useState<Chains>();
	const [domain, setDomain] = useState<string>();
	const [isCaptchaNeeded, setIsCaptchaNeeded] = useState<boolean>();
	const [isWalletRequired, setIsWalletRequired] = useState<boolean>();

	const [wallet, setWallet] = useState<string>();
	const [connection, setConnection] = useState<Connections>();

	const router = useRouter();
	const id = router.query.id as string;

	const fetchIsCaptchaNeeded = useCallback(async () => {
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
	}, []);

	const nextStep = useCallback(() => {
		// Check the current step and set a corresponding next step
		switch (step) {
			case Step.Start:
				if (isCaptchaNeeded) {
					setStep(Step.CaptchaCheck);
				} else if (isWalletRequired) {
					setStep(Step.Wallet);
				} else {
					setStep(Step.ProcessInvite);
				}
				break;
			case Step.CaptchaCheck:
				if (isWalletRequired) {
					setStep(Step.Wallet);
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
	}, [step, isCaptchaNeeded, isWalletRequired]);

	const onCaptchaSuccess = useCallback(
		async (token: string) => {
			const { success: isSuccess } = await api.captcha().post(token);
			if (isSuccess) {
				nextStep();
				return true;
			}
			return false;
		},
		[nextStep]
	);

	const onWalletConnect: WalletInviteProps["onConnect"] = useCallback(
		async ({ connectedChain, connectedAddress, connection }) => {
			setConnection(connection);
			setWallet([connectedChain, connectedAddress].join(":"));
			nextStep();
		},
		[nextStep]
	);

	const initialize = useCallback(async () => {
		const loader = new TileLoader({ ceramic });
		const stream = await loader.load<CampaignReference>(id);
		const campaignRef = stream.content;
		const [campaign] = await campaignsProvider.getCampaigns([campaignRef]);

		setChain(campaign.chain);
		setDomain(new URL(campaign.details.destinationUrl).hostname);
		setIsWalletRequired(
			campaign.events.some((e) => e.contractAddress && e.contractEvent)
		);
		setIsCaptchaNeeded(await fetchIsCaptchaNeeded());
	}, [fetchIsCaptchaNeeded, id]);

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

		if (isWalletRequired ? !wallet || !connection : false) {
			handleException(ono("Invite being processed when there is no wallet"));
			onError();
			return;
		}

		try {
			const referral = await api.referrals().post(id, wallet, connection);

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
	}, [connection, id, isWalletRequired, wallet]);

	useEffect(() => {
		(async () => {
			await initialize();
			setStep(Step.Start);
		})();
	}, [initialize]);

	useEffect(() => {
		(async () => {
			if (step === Step.Start) {
				await nextStep();
			} else if (step === Step.ProcessInvite) {
				await processInvite();
			}
		})();
	}, [step, nextStep, processInvite]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			flex={1}
			position="relative"
		>
			{step === Step.Init && <Preloader message={`You've been invited...`} />}
			{step === Step.CaptchaCheck && <Captcha onSuccess={onCaptchaSuccess} />}
			{step === Step.Wallet && (
				<WalletInvite
					chain={chain as Chains}
					domain={domain as string}
					onConnect={onWalletConnect}
				/>
			)}
			{step === Step.ProcessInvite && (
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
				<Image src={BrandLogoDark} width={120} objectFit="contain" />
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
