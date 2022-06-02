import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { Pane, toaster } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";

import { useUser } from "@/hooks/";
import { MAX_SCREEN_WIDTH } from "@/constants";
import ClaimButton from "@/components/ClaimButton";
import Terms from "@/components/Campaign/Terms";
import Progress from "@/components/Progress";
import delay from "@/utils/delay";
import { Chains, Partnership, Campaign, RewardTypes, Wallet } from "@/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useRedir from "@/hooks/use-redir";
import Serve404 from "@/components/Serve404";
import handleException from "@/utils/handle-exception";
import Banner from "@/components/Campaign/Banner";
import Info from "@/components/Campaign/Info";
import Actions from "@/components/Campaign/Actions";
import PartnershipUI from "@/components/Campaign/Partnership";
import StartPartnership from "@/components/Campaign/StartPartnership";
import ValueCard from "@/components/ValueCard";
import VerifyPersonhoodAlert from "@/components/VerifyPersonhoodAlert";
import ViewerWallet from "@/components/Campaign/ViewerWallet";

const getCampaign = async (id: string, chain: Chains) => {
	await delay(5000);
	const campaignsData = (await import("@/seed/campaigns.json")).default;
	const campaigns = camelcaseKeys(campaignsData, { deep: true });

	return campaigns[0];
};

const CampaignPage = () => {
	const {
		user: { wallets },
		isLoading: isUserLoading,
		actions: { addPartnership }
	} = useUser();
	const router = useRouter();
	const { id, chain } = router.query as { id: string; chain: Chains };
	const campaign = useQuery("campaign", () => getCampaign(id as string, chain));
	const loginUrl = useRedir("/login");
	const isLoggedIn = wallets.length > 0;

	if (!campaign.isLoading && !campaign.data) {
		return <Serve404 />;
	}

	const [isPartnering, setPartnering] = useState(false);

	const walletsForChain = wallets.filter((w) => w.chain === chain);
	const partnerWallets = walletsForChain.filter(
		(wallet) =>
			!!wallet.partnerships.find(
				(p) => p.campaign.address === id && p.campaign.chain === chain
			)
	);
	const partnerships = isLoggedIn
		? walletsForChain.reduce<Partnership[]>((p, wallet) => {
				return p.concat(wallet.partnerships);
		  }, [])
		: [];
	const partnership = partnerships.find(
		(p) => p.campaign.address === id && p.campaign.chain === chain
	);
	const [viewerWallet, setViewerWallet] = useState(
		partnerWallets.length > 0 ? partnerWallets[0] : null
	);

	useEffect(() => {
		if (!viewerWallet && partnerWallets.length > 0) {
			setViewerWallet(partnerWallets[0]);
		}
	}, [partnerWallets]);

	const onStartPartnership = useCallback(
		(selected: Wallet | null = null) => {
			if (!selected) {
				router.push(loginUrl);
				return;
			}
			const errorMessage = () =>
				toaster.danger(
					"Oops! Something has gone wrong partnering with this campaign.",
					{
						id: "start-partnership-error-message"
					}
				);
			if (!campaign.isLoading && campaign.data) {
				setPartnering(true);
				const campaignRef = {
					chain,
					address: campaign.data.id
				};
				addPartnership(selected, campaignRef)
					.catch((e) => {
						if (e instanceof Error) {
							handleException(e, null);
						}
						errorMessage();
					})
					.finally(() => {
						setPartnering(false);
					});
			} else {
				errorMessage();
			}
		},
		[loginUrl, campaign]
	);

	// useEffect(() => {
	// 	if (user !== null) {
	// 		const eventPayload = {
	// 			id: advertiser.usherContractAddress,
	// 			nativeId: user.id,
	// 			properties: {
	// 				walletAddress: wallet.address
	// 			}
	// 		};
	// 		Usher("event", eventPayload);
	// 	}
	// }, []);

	return (
		<Pane
			display="flex"
			alignItems="center"
			flexDirection="column"
			maxWidth={MAX_SCREEN_WIDTH - 32}
			marginX="auto"
			width="100%"
		>
			{!campaign.isLoading &&
			campaign.data &&
			(campaign.data.details.image || campaign.data.advertiser.icon) ? (
				<Banner campaign={campaign.data as Campaign} />
			) : (
				<Pane paddingY={16} />
			)}
			<Pane paddingTop={24} paddingBottom={0} paddingX={16} width="100%">
				{!campaign.isLoading && campaign.data ? (
					<Pane
						display="flex"
						flexDirection="row"
						alignItems="flex-start"
						justifyContent="space-between"
						width="100%"
					>
						<Pane flex={1}>
							<Info campaign={campaign.data as Campaign} />
						</Pane>
						<Pane width="40%">
							<Pane
								display="flex"
								flexDirection="row"
								alignItems="center"
								justifyContent="flex-end"
							>
								{viewerWallet && (
									<Pane marginRight={12}>
										<ViewerWallet
											selected={viewerWallet}
											options={partnerWallets}
											buttonProps={{
												height: 50
											}}
											onSelect={(w: Wallet) => setViewerWallet(w)}
										/>
									</Pane>
								)}
								<Actions chain={chain} campaign={campaign.data as Campaign} />
							</Pane>
						</Pane>
					</Pane>
				) : (
					<Skeleton
						count={5}
						style={{
							maxWidth: 500
						}}
					/>
				)}
			</Pane>
			<Pane
				display="flex"
				flexDirection="row"
				width="100%"
				padding={16}
				// className={css`
				// 	@media (max-width: ${TABLET_BREAKPOINT}px) {
				// 		flex-direction: column !important;
				// 	}
				// `}
			>
				<Pane flex={1} margin={6}>
					{!campaign.isLoading && !isUserLoading ? (
						<>
							{partnership ? (
								<PartnershipUI partnership={partnership} />
							) : (
								<StartPartnership
									onStart={onStartPartnership}
									chain={chain}
									isLoading={isPartnering}
									wallets={walletsForChain}
								/>
							)}
						</>
					) : (
						<Skeleton
							style={{
								height: 300,
								borderRadius: 8
							}}
						/>
					)}
				</Pane>
				<Pane
					width="40%"
					margin={6}
					// className={css`
					// 	@media (max-width: ${TABLET_BREAKPOINT}px) {
					// 		width: 100% !important;
					// 	}
					// `}
				>
					{!campaign.isLoading && campaign.data ? (
						<>
							{campaign.data.reward.limit > 0 && (
								<Pane
									background="tint2"
									borderRadius={8}
									padding={12}
									marginBottom={12}
								>
									<Progress
										value={0}
										label={`${0} / ${campaign.data.reward.limit} ${
											campaign.data.reward.ticker
										}${
											campaign.data.reward.type !== RewardTypes.TOKEN
												? ` ${campaign.data.reward.type.toUpperCase()}s`
												: ""
										} Claimed`}
										showPercentage
									/>
								</Pane>
							)}
						</>
					) : (
						<Skeleton
							style={{
								height: 100,
								borderRadius: 8,
								marginBottom: 12
							}}
						/>
					)}
					{partnership && (
						<>
							<Pane
								padding={12}
								background="tint2"
								borderRadius={8}
								marginBottom={24}
							>
								<Pane display="flex" marginBottom={24}>
									{!campaign.isLoading && campaign.data ? (
										<ValueCard
											// isLoading={false}
											ticker={campaign.data.reward.ticker}
											// value={claimableRewards}
											value={0}
											id="claimable-rewards"
											label="Claimable Rewards"
										/>
									) : (
										<Skeleton
											style={{
												borderRadius: 8,
												height: 150
											}}
										/>
									)}
								</Pane>
								<Pane display="flex">
									{!campaign.isLoading && campaign.data ? (
										<ClaimButton />
									) : (
										<Skeleton
											style={{
												borderRadius: 8,
												height: 50
											}}
										/>
									)}
								</Pane>
							</Pane>
							<Pane marginBottom={12}>
								{!isUserLoading ? (
									<VerifyPersonhoodAlert />
								) : (
									<Skeleton
										style={{
											borderRadius: 8,
											height: 100
										}}
									/>
								)}
							</Pane>
						</>
					)}
					<Pane marginBottom={12}>
						{!campaign.isLoading && campaign.data ? (
							<Terms campaign={campaign.data as Campaign} />
						) : (
							<Skeleton
								style={{
									borderRadius: 8,
									height: 100
								}}
							/>
						)}
					</Pane>
				</Pane>
			</Pane>
		</Pane>
	);
};

export default CampaignPage;
