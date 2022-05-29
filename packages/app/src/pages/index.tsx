// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Pane, Heading } from "evergreen-ui";
import { useQuery } from "react-query";
import range from "lodash/range";
import camelcaseKeys from "camelcase-keys";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { useUser } from "@/hooks";
import CampaignCard from "@/components/CampaignCard";
import { Campaign } from "@/types";
import delay from "@/utils/delay";

const getCampaigns = async (): Promise<Campaign[]> => {
	await delay(5000);
	const campaignsData = (await import("@/seed/campaigns.json")).default;
	const campaigns = camelcaseKeys(campaignsData, { deep: true });

	return campaigns as Campaign[];
};

const Partnerships = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();
	const [mount, setMount] = useState(false);
	const campaigns = useQuery("active-campaigns", getCampaigns, {
		cacheTime: 15 * 60000
	});

	useEffect(() => {
		// If user is no longer loading and there is still no wallet loaded...
		if (!isLoading && wallets.length === 0) {
			router.push("/explore"); // Redirect to explore page if not authorised.
		}
		if (wallets.length > 0) {
			setMount(true);
		}
	}, [wallets, isLoading]);

	return (
		mount && (
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
					{campaigns.isLoading &&
						!campaigns.data &&
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
					{!campaigns.isLoading &&
						campaigns.data &&
						campaigns.data.map((campaign) => {
							return <CampaignCard campaign={campaign} key={campaign.id} />;
						})}
				</Pane>
			</Pane>
		)
	);
};

export default Partnerships;
