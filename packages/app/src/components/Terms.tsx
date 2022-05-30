/**
 * This is a configurable Terms & Conditions Alert for Affiliates
 * Affiliates are partnering with Advertisers, so terms are vital for Advertisers to configure and for Affiliates to read
 */

import React from "react";
import {
	Alert,
	UnorderedList,
	ListItem,
	Strong,
	Paragraph,
	Button,
	majorScale,
	useTheme
} from "evergreen-ui";
import startCase from "lodash/startCase";

import { Campaign, CampaignStrategies, RewardTypes } from "@/types";
import Anchor from "@/components/Anchor";
import { UilExternalLinkAlt } from "@iconscout/react-unicons";

export type Props = {
	campaign: Campaign;
};

const Terms: React.FC<Props> = ({ campaign }) => {
	const { colors } = useTheme();
	const ticker = campaign.reward.ticker.toUpperCase();
	const name = startCase(campaign.reward.name);

	return (
		<Alert intent="none" title="Referral Program Terms & Conditions">
			<UnorderedList marginBottom={12}>
				<ListItem>
					Rewards are paid in{" "}
					<Strong>
						{name} ({ticker})
					</Strong>{" "}
					{campaign.reward.type !== RewardTypes.TOKEN && (
						<Strong>{campaign.reward.type.toUpperCase()}s</Strong>
					)}
				</ListItem>
				{campaign.events.length > 1 ? (
					<ListItem>
						Earn rewards at different points throughout the referred user
						journey.
						<UnorderedList>
							{campaign.events.map((event) => (
								<ListItem>
									{event.rate}
									{event.strategy === CampaignStrategies.PERCENTAGE
										? "% in"
										: ""}{" "}
									{ticker} {event.limit > 0 ? "up to a limit" : ""}
								</ListItem>
							))}
						</UnorderedList>
					</ListItem>
				) : (
					<ListItem>
						Earn{" "}
						<Strong>
							{campaign.events[0].rate}
							{campaign.events[0].strategy === CampaignStrategies.PERCENTAGE
								? "% in"
								: ""}{" "}
							{ticker}
						</Strong>{" "}
						per referral{campaign.events[0].limit > 0 ? "up to a limit" : ""}
					</ListItem>
				)}
				{campaign.reward.limit > 0 && (
					<ListItem>
						The campaign will end once{" "}
						<Strong>
							{campaign.reward.limit} {ticker}
						</Strong>{" "}
						are claimed
					</ListItem>
				)}
			</UnorderedList>
			{campaign.details.externalLink && (
				<>
					<Paragraph size={400}>For more information</Paragraph>
					<Anchor href={campaign.details.externalLink} external>
						<Button
							height={majorScale(4)}
							iconAfter={() => <UilExternalLinkAlt size="22" />}
						>
							<Strong>Learn more</Strong>
						</Button>
					</Anchor>
				</>
			)}
			<Paragraph size={300} color={colors.gray700}>
				<Strong>
					<i>Usher software is in ALPHA. Please refer responsibly.</i>
				</Strong>
			</Paragraph>
		</Alert>
	);
};

export default Terms;
