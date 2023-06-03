import React from "react";
import { Heading, Paragraph, Strong, Text } from "evergreen-ui";

import { Campaign } from "@usher.so/campaigns";
import Anchor from "@/components/Anchor";
import truncate from "@/utils/truncate";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = {
	campaign: Campaign;
};

const CampaignTitle: React.FC<Props> = ({ campaign }) => {
	const { colors } = useCustomTheme();

	const advertiserName = campaign.advertiser.name
		? campaign.advertiser.name
		: truncate(campaign.owner, 6, 4);

	return (
		<>
			<Heading is="h1" size={900} width="100%" marginBottom={8}>
				{campaign.details.name}
			</Heading>
			<Heading size={600} fontWeight={400} color={colors.gray900}>
				By{" "}
				{campaign.advertiser.externalLink ? (
					<Anchor
						href={campaign.advertiser.externalLink}
						external
						fontSize="inherit"
					>
						<Strong
							fontSize="inherit"
							textDecoration="underline"
							color={colors.blue500}
						>
							{advertiserName}
						</Strong>
					</Anchor>
				) : (
					<Strong fontSize="inherit" color={colors.gray900}>
						{advertiserName}
					</Strong>
				)}
				{campaign.advertiser.description && (
					<Text size={500} opacity="0.7" fontSize="inherit">
						&nbsp;&nbsp;&mdash;&nbsp;&nbsp;
						{campaign.advertiser.description}
					</Text>
				)}
			</Heading>
			{campaign.details.description && (
				<Paragraph size={500} marginTop={10} fontSize="1.2em">
					{campaign.details.description}
				</Paragraph>
			)}
		</>
	);
};

export default CampaignTitle;
