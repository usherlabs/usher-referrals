import React from "react";
import { css } from "@linaria/core";
import { Pane, Paragraph, Strong, useTheme } from "evergreen-ui";

import { Campaign } from "@/types";
import Anchor from "@/components/Anchor";
import truncate from "@/utils/truncate";

export type Props = {
	campaign: Campaign;
};

const CampaignCard: React.FC<Props> = ({ campaign }) => {
	const { colors } = useTheme();
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
		<Pane padding={16} width="25%" minWidth="300px">
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
};

export default CampaignCard;
