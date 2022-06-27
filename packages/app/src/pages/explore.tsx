import { Pane, Heading } from "evergreen-ui";
import camelcaseKeys from "camelcase-keys";
import { aql } from "arangojs";

import CampaignCard from "@/components/CampaignCard";
import { Campaign } from "@/types";
import { useSeedData } from "@/env-config";
import { getArangoClient } from "@/utils/arango-client";

/**
 * TODO:
 * - Add pagination
 */

type ExploreProps = {
	campaigns: Campaign[];
};

const Explore: React.FC<ExploreProps> = ({ campaigns }) => {
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
				{campaigns.map((campaign) => {
					return <CampaignCard campaign={campaign} key={campaign.id} />;
				})}
			</Pane>
		</Pane>
	);
};

const getCampaigns = async (): Promise<Campaign[]> => {
	if (useSeedData) {
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

	const arango = getArangoClient();
	const cursor = await arango.query(aql`
		FOR c IN Campaigns
			RETURN c
	`);

	const campaigns = [];
	for await (const result of cursor) {
		const campaign = Object.entries(result).reduce<typeof result>(
			(acc, [key, value]) => {
				if (key.charAt(0) !== "_") {
					acc[key] = value;
				}
				return acc;
			},
			{}
		);
		campaigns.push(campaign);
	}

	return campaigns;
};

export async function getStaticProps() {
	const campaigns = await getCampaigns();

	return {
		props: {
			campaigns,
			seo: {
				title: "Explore Campaigns",
				description:
					"Explore and engage with Affiliate Campaigns launched by applications on Web3"
			}
		}
	};
}

export default Explore;
