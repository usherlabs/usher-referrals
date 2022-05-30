// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { Campaign } from "@/types";
import delay from "@/utils/delay";

const getCampaigns = async (): Promise<Campaign[]> => {
	await delay(5000);
	// const campaignsData = (await import("@/seed/campaigns.json")).default;
	// const campaigns = camelcaseKeys(campaignsData, { deep: true });

	// return campaigns as Campaign[];
	return [];
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
						(!campaigns.data || isEmpty(campaigns.data)) && (
							<Pane paddingX={16}>
								<Heading size={600} marginBottom={8}>
									Start by engaging campaigns
								</Heading>
								<Paragraph size={500} marginBottom={12}>
									You do not have any active partnerships. Explore &amp;
									discover campaigns to get started!
								</Paragraph>
								<Anchor href="/explore">
									<Button
										appearance="primary"
										minWidth={200}
										height={majorScale(6)}
									>
										<Strong color="#fff" size={500}>
											Get started
										</Strong>
									</Button>
								</Anchor>
							</Pane>
						)}
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
