import { Pane, Heading } from "evergreen-ui";
import { useQuery } from "react-query";
import camelcaseKeys from "camelcase-keys";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import range from "lodash/range";

import CampaignCard from "@/components/CampaignCard";
import delay from "@/utils/delay";
import { Campaign } from "@/types";
import { useSeedData } from "@/env-config";

const getCampaigns = async (): Promise<Campaign[]> => {
	if (useSeedData) {
		await delay(5000);
		const campaignsData = (await import("@/seed/campaigns.json")).default;
		const campaigns = camelcaseKeys(campaignsData, { deep: true });

		// return campaigns as Campaign[];

		const seedCampaigns = [
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0],
			campaigns[0]
		];
		return seedCampaigns as Campaign[];
	}

	return [];
};

/**
 * TODO:
 * - Add pagination
 */

const Explore = () => {
	const campaigns = useQuery("campaigns", getCampaigns, {
		cacheTime: 15 * 60000
	});

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
				Explore Campaigns
			</Heading>
			<Pane width="100%" display="flex" flexWrap="wrap">
				{campaigns.isLoading &&
					!campaigns.data &&
					range(8).map((i) => (
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
				{!campaigns.isLoading &&
					campaigns.data &&
					campaigns.data.map((campaign) => {
						return <CampaignCard campaign={campaign} key={campaign.id} />;
					})}
			</Pane>
		</Pane>
	);
};

export async function getStaticProps() {
	return {
		props: {
			seo: {
				title: "Explore Campaigns",
				description:
					"Explore and engage with Affiliate Campaigns launched by applications on Web3"
			}
		}
	};
}

export default Explore;
