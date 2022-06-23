// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import {
	Pane,
	Heading,
	Paragraph,
	Button,
	majorScale,
	Strong
} from "evergreen-ui";
import { useQuery } from "react-query";
import range from "lodash/range";
import camelcaseKeys from "camelcase-keys";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import isEmpty from "lodash/isEmpty";

import { useUser } from "@/hooks";
import CampaignCard from "@/components/CampaignCard";
import Anchor from "@/components/Anchor";
import { Campaign, CampaignReference } from "@/types";
import delay from "@/utils/delay";
import { useSeedData } from "@/env-config";
import * as api from "@/api";

const getCampaigns = async (refs: CampaignReference[]): Promise<Campaign[]> => {
	if (useSeedData) {
		await delay(2000);
		const campaignsData = (await import("@/seed/campaigns.json")).default;
		const campaigns = camelcaseKeys(campaignsData, { deep: true });

		return campaigns as Campaign[];
	}

	if (refs.length === 0) {
		return [];
	}

	const campaigns = await api.campaigns().get(refs);

	return campaigns.data;
};

const Partnerships = () => {
	const {
		user: { wallets, partnerships },
		isLoading: isUserLoading
	} = useUser();
	const campaigns = useQuery(
		"active-campaigns",
		() => getCampaigns(partnerships.map(({ campaign }) => campaign)),
		{
			cacheTime: 15 * 60000
		}
	);
	const isAuthLoading = wallets.length === 0 && isUserLoading;

	return (
		<Pane
			display="flex"
			alignItems="center"
			flexDirection="column"
			marginX="auto"
			padding={48}
			width="100%"
		>
			<Heading
				is="h1"
				size={900}
				width="100%"
				padding={16}
				textAlign="left"
				fontSize="2.5em"
				marginBottom={24}
			>
				My Partnerships
			</Heading>
			<Pane width="100%" display="flex" flexWrap="wrap">
				{(isAuthLoading || (campaigns.isLoading && !campaigns.data)) &&
					range(4).map((i) => (
						<Pane padding={16} width="25%" minWidth="300px" key={i}>
							<Skeleton
								height={360}
								width="100%"
								style={{
									borderRadius: 8
								}}
							/>
						</Pane>
					))}
				{!isAuthLoading &&
					!campaigns.isLoading &&
					(!campaigns.data || isEmpty(campaigns.data)) && (
						<Pane paddingX={16}>
							<Heading size={700} marginBottom={8}>
								Start by engaging campaigns
							</Heading>
							<Paragraph size={500} marginBottom={24} fontSize="1.1em">
								You do not have any active partnerships. Explore &amp; discover
								campaigns to get started!
							</Paragraph>
							<Anchor href="/explore">
								<Button
									appearance="primary"
									minWidth={300}
									height={majorScale(7)}
								>
									<Strong color="#fff" size={500} fontSize="1.2em">
										👉&nbsp;&nbsp;Get started
									</Strong>
								</Button>
							</Anchor>
						</Pane>
					)}
				{!isAuthLoading &&
					!campaigns.isLoading &&
					campaigns.data &&
					campaigns.data.map((campaign) => {
						return <CampaignCard campaign={campaign} key={campaign.id} />;
					})}
			</Pane>
		</Pane>
	);
};

export default Partnerships;
