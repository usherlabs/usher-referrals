import React from "react";
import {
	Heading,
	Strong,
	useTheme,
	Paragraph,
	ListItem,
	UnorderedList,
	Pane,
	Button,
	majorScale
} from "evergreen-ui";
import {
	Accordion,
	AccordionItem,
	AccordionItemHeading,
	AccordionItemButton,
	AccordionItemPanel
} from "react-accessible-accordion";
import {
	UilFileContract,
	UilLabel,
	UilExternalLinkAlt
} from "@iconscout/react-unicons";
import startCase from "lodash/startCase";
import { cx, css } from "@linaria/core";

import { RewardTypes, Campaign, CampaignStrategies } from "@/types";
import Anchor from "@/components/Anchor";
import "react-accessible-accordion/dist/fancy-example.css";

export type Props = {
	campaign: Campaign;
};

const CampaignInfoAccordions: React.FC<Props> = ({ campaign }) => {
	const { colors } = useTheme();
	const ticker = campaign.reward.ticker.toUpperCase();
	const name = startCase(campaign.reward.name);

	return (
		<Pane
			className={css`
				li,
				strong {
					font-size: inherit;
				}
			`}
		>
			<Accordion
				className={css`
					.accordion__button {
						position: relative;
						display: flex;
						align-items: center;
						background-color: #f9fafc;
						transition: background-color 0.1s;

						:hover {
							background-color: #edeff5;
						}

						:before {
							position: absolute;
							right: 10px;
						}
					}
					.accordion__panel {
						padding: 20px;
						background-color: #f9fafc;
						border-top: 2px solid #c1c4d6;

						[hidden] {
							border-top: none !important;
						}
					}
					.accordion__item {
						border: 2px solid #c1c4d6;
						margin-bottom: 4px;
						border-radius: 8px;
						overflow: hidden;
					}
				`}
			>
				<AccordionItem>
					<AccordionItemHeading>
						<AccordionItemButton
							className={cx(
								`accordion__button`,
								css`
									border-radius: 8px 8px 0 0;
								`
							)}
						>
							<Pane display="flex" flexDirection="row" alignItems="center">
								<UilLabel size={28} color={colors.gray900} />
								<Heading is="h5" size={600} margin={0} marginLeft={8}>
									Properties
								</Heading>
							</Pane>
						</AccordionItemButton>
					</AccordionItemHeading>
					<AccordionItemPanel
						className={cx(
							"accordion__panel",
							css`
								padding: 20px;
								padding-top: 10px;
								border-radius: 0 0 8px 8px;
							`
						)}
					>
						<Pane>Hello world</Pane>
					</AccordionItemPanel>
				</AccordionItem>
				<AccordionItem
					className={cx(
						"accordion__item",
						css`
							border: 2px solid #3366ff !important;
						`
					)}
				>
					<AccordionItemHeading>
						<AccordionItemButton
							className={cx(
								`accordion__button`,
								css`
									background-color: #ebf0ff !important;

									:before {
										color: #3366ff !important;
									}

									:hover {
										background-color: #d6e0ff !important;
									}
								`
							)}
						>
							<Pane display="flex" flexDirection="row" alignItems="center">
								<UilFileContract size={28} color={colors.blue500} />
								<Heading
									is="h5"
									size={600}
									margin={0}
									marginLeft={8}
									color={colors.blue500}
								>
									Terms &amp; Conditions
								</Heading>
							</Pane>
						</AccordionItemButton>
					</AccordionItemHeading>
					<AccordionItemPanel
						className={cx(
							"accordion__panel",
							css`
								border-radius: 0 0 8px 8px;
								border-top: 2px solid #3366ff !important;

								[hidden] {
									border-top: none !important;
								}
							`
						)}
					>
						<UnorderedList marginBottom={12} marginTop={-8}>
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
										{campaign.events.map((event, i) => (
											<ListItem key={`${i}-${event.strategy}-${event.rate}`}>
												{typeof event.perCommit !== "undefined" &&
												!!event.perCommit
													? "At least "
													: ""}
												{event.strategy === CampaignStrategies.PERCENTAGE
													? `${event.rate * 100}% in`
													: event.rate}{" "}
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
										{campaign.events[0].strategy ===
										CampaignStrategies.PERCENTAGE
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
					</AccordionItemPanel>
				</AccordionItem>
			</Accordion>
		</Pane>
	);
};

export default CampaignInfoAccordions;
