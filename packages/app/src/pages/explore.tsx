import { useTheme, Pane, Heading, Paragraph, Strong } from "evergreen-ui";
import { useQuery } from "react-query";
import camelcaseKeys from "camelcase-keys";
import { css } from "@linaria/core";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import range from "lodash/range";

import DashboardContainer from "@/containers/Dashboard";
import delay from "@/utils/delay";
import { Campaign } from "@/types";
import Anchor from "@/components/Anchor";
import truncate from "@/utils/truncate";

const getCampaigns = async (): Promise<Campaign[]> => {
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
};

/**
 * TODO:
 * - Add pagination
 */

const Explore = () => {
	const { colors } = useTheme();
	const campaigns = useQuery("campaigns", getCampaigns, {
		cacheTime: 15 * 60000
	});

	return (
		<DashboardContainer>
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
					padding={6}
					textAlign="center"
					fontSize="2.5em"
					marginBottom={24}
				>
					Explore Campaigns
				</Heading>
				<Pane width="100%" display="flex" flexWrap="wrap">
					{campaigns.isLoading &&
						!campaigns.data &&
						range(8).map(() => (
							<Pane padding={16} width="25%" minWidth="300px">
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
							const bgColors = [
								colors.gray500,
								colors.red500,
								colors.blue500,
								colors.green500,
								colors.orange500,
								colors.purple600
							];
							const r = Math.floor(Math.random() * bgColors.length);
							const bgColor = bgColors[r];

							return (
								<Pane
									padding={16}
									width="25%"
									minWidth="300px"
									key={campaign.id}
								>
									<Anchor href={`/campaign/arweave/${campaign.id}`}>
										<Pane
											border
											borderRadius={8}
											overflow="hidden"
											className={css`
												transition: all 0.25s;
												box-shadow: none;
												transform: translateY(0);
												&:hover {
													box-shadow: 0 10px 13px rgba(0, 0, 0, 0.1);
													transform: translateY(-5px);
												}
											`}
										>
											<Pane
												borderBottom
												height={200}
												backgroundImage={`url(${campaign.details.image})`}
												backgroundPosition="center"
												backgroundSize="cover"
												backgroundColor={bgColor}
												backgroundRepeat="no-repeat"
												boxShadow="inset 0 -5px 20px rgba(0, 0, 0, 0.25)"
											/>
											<Pane paddingX={16} paddingBottom={16}>
												{campaign.advertiser.icon && (
													<Pane
														borderRadius={12}
														borderBottomLeftRadius={0}
														borderBottomRightRadius={0}
														marginTop={-50}
														height={50}
														backgroundImage={`url(${campaign.advertiser.icon})`}
														backgroundSize="contain"
														backgroundRepeat="no-repeat"
														backgroundPosition="center"
														border="5px solid #fff"
														borderBottom="none"
														backgroundColor="#fff"
														maxWidth={150}
													/>
												)}
												<Pane
													display="flex"
													flexDirection="row"
													justifyContent="space-between"
												>
													<Pane flex={1}>
														<Paragraph marginTop={10}>
															<Strong fontSize="1.1em" color={colors.gray900}>
																{truncate(campaign.details.name, 40, 0)}
															</Strong>
														</Paragraph>
														<Paragraph color={colors.gray900}>
															By{" "}
															<Strong>
																{campaign.advertiser.name
																	? truncate(campaign.advertiser.name, 40, 0)
																	: truncate(campaign.owner, 6, 4)}
															</Strong>
														</Paragraph>
													</Pane>
												</Pane>
												<Paragraph
													size={500}
													color={colors.gray700}
													marginTop={10}
													height={75}
												>
													{campaign.details.description
														? truncate(campaign.details.description, 140, 0)
														: ""}
												</Paragraph>
											</Pane>
										</Pane>
									</Anchor>
								</Pane>
							);
						})}
				</Pane>
			</Pane>
		</DashboardContainer>
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
