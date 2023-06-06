// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import {
	Button,
	Heading,
	majorScale,
	Pane,
	Paragraph,
	Strong
} from "evergreen-ui";
import { useQuery } from "react-query";
import range from "lodash/range";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import isEmpty from "lodash/isEmpty";

import { useUser } from "@/hooks";
import CampaignCard from "@/components/CampaignCard";
import Anchor from "@/components/Anchor";
import { Campaigns } from "@usher.so/campaigns";
import { API_OPTIONS } from "@/constants";
import PageHeader from "@/components/PageHeader";
import React from "react";

// TODO: Consider what to do wiht the seed logic
// const getCampaigns = async (refs: CampaignReference[]): Promise<Campaign[]> => {
// 	if (useSeedData) {
// 		await delay(2000);
// 		const campaignsData = (await import("@/seed/campaigns.json")).default;
// 		const campaigns = camelcaseKeys(campaignsData, { deep: true });

// 		return campaigns as Campaign[];
// 	}

// 	if (refs.length === 0) {
// 		return [];
// 	}

// 	const campaigns = await api.campaigns().get(uniqWith(refs, isEqual));

// 	return campaigns.data;
// };
const campaignsProvider = new Campaigns(API_OPTIONS);

const Partnerships = () => {
	const {
		user: { partnerships },
		isLoading: isUserLoading
	} = useUser();
	const campaigns = useQuery(["active-campaigns", partnerships], () =>
		campaignsProvider.getCampaigns(partnerships.map(({ campaign }) => campaign))
	);
	const isLoading = isUserLoading || campaigns.isLoading;

	return (
		<Pane display="flex" flexDirection="column" flex={1} padding="40px">
			<PageHeader
				title="My Partnerships"
				description="View Campaigns you are in partnerships with."
			/>

			<Pane width="100%" display="flex" flexWrap="wrap">
				{isLoading &&
					isEmpty(campaigns.data) &&
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
				{!isLoading && isEmpty(campaigns.data) && (
					<Pane paddingX={16} marginTop={40}>
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
				{!isLoading && campaigns.data && !isEmpty(campaigns.data)
					? campaigns.data.map((campaign) => {
							return <CampaignCard campaign={campaign} key={campaign.id} />;
					  })
					: null}
			</Pane>
		</Pane>
	);
};

export default Partnerships;
