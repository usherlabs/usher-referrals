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
	useTheme,
	Pane
} from "evergreen-ui";
import startCase from "lodash/startCase";
import { css } from "@linaria/core";

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
		<Alert
			intent="none"
			title="Referral Program Terms &amp; Conditions"
			className={css`
				h4 {
					font-size: 1em;
					margin: 1px 0 10px 0;
				}
				li,
				strong {
					font-size: inherit;
				}
				svg {
					height: 20px;
					width: 20px;
				}
			`}
			fontSize="0.95em"
		>
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
						Rewards are earned at multiple events
						<UnorderedList>
							{campaign.events.map((event) => (
								<ListItem>
									{typeof campaign.events[0].perCommit !== "undefined" &&
									!!campaign.events[0].perCommit
										? "At least "
										: ""}
									{event.rate}
									{event.strategy === CampaignStrategies.PERCENTAGE
										? "% in"
										: ""}{" "}
									{ticker}{" "}
									{event.nativeLimit && event.nativeLimit > 0
										? "up to a limit"
										: ""}
									{event.description ? ` when ${event.description}` : ""}
								</ListItem>
							))}
						</UnorderedList>
					</ListItem>
				) : (
					<ListItem>
						Earn{" "}
						{typeof campaign.events[0].perCommit !== "undefined" &&
						!!campaign.events[0].perCommit
							? "at least "
							: ""}
						<Strong>
							{campaign.events[0].rate}
							{campaign.events[0].strategy === CampaignStrategies.PERCENTAGE
								? "% in"
								: ""}{" "}
							{ticker}
						</Strong>{" "}
						per referral
						{campaign.events[0].nativeLimit &&
						campaign.events[0].nativeLimit > 0
							? " up to a limit"
							: ""}
						{campaign.events[0].description
							? ` when ${campaign.events[0].description}`
							: ""}
					</ListItem>
				)}
				{campaign.reward.limit && campaign.reward.limit > 0 ? (
					<ListItem>
						The campaign will end once{" "}
						<Strong>
							{campaign.reward.limit} {ticker}
						</Strong>{" "}
						are claimed
					</ListItem>
				) : null}
			</UnorderedList>
			{campaign.details.externalLink && (
				<Pane borderTop="1px solid rgba(0, 0, 0, 0.1)" paddingTop={10}>
					<Paragraph size={400}>For more information</Paragraph>
					<Anchor href={campaign.details.externalLink} external>
						<Button
							height={majorScale(4)}
							iconAfter={() => <UilExternalLinkAlt size="18" />}
						>
							<Strong>Learn more</Strong>
						</Button>
					</Anchor>
				</Pane>
			)}
			<Paragraph size={300} color={colors.gray700} marginTop={12}>
				<Strong>
					<i>Usher software is in ALPHA. Please refer responsibly.</i>
				</Strong>
			</Paragraph>
		</Alert>
	);
};

export default Terms;
