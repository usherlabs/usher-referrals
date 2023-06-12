import React from "react";
import {
	Heading,
	Label,
	ListItem,
	Pane,
	Strong,
	Text,
	UnorderedList
} from "evergreen-ui";
import {
	Accordion,
	AccordionItem,
	AccordionItemButton,
	AccordionItemHeading,
	AccordionItemPanel
} from "react-accessible-accordion";
import {
	UilExternalLinkAlt,
	UilFileContract,
	UilNotes
} from "@iconscout/react-unicons";
import startCase from "lodash/startCase";
import { css, cx } from "@linaria/core";

import { Chains } from "@usher.so/shared";
import { Campaign, CampaignStrategies, RewardTypes } from "@usher.so/campaigns";
import Anchor from "@/components/Anchor";
import "react-accessible-accordion/dist/fancy-example.css";
import pascalCase from "@/utils/pascal-case";
import truncate from "@/utils/truncate";
import {
	ARWEAVE_EXPLORER_ADDRESS_URL,
	ETHEREUM_EXPLORER_ADDRESS_URL
} from "@/constants";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = {
	campaign: Campaign;
};

const CampaignInfoAccordions: React.FC<Props> = ({ campaign }) => {
	const { colors } = useCustomTheme();
	const ticker = campaign.reward.ticker.toUpperCase();
	const name = startCase(campaign.reward.name);

	let rewardContractAddressUrl = "";
	if (campaign.reward.address) {
		if (campaign.chain === Chains.ARWEAVE) {
			rewardContractAddressUrl = `${ARWEAVE_EXPLORER_ADDRESS_URL}${campaign.reward.address}`;
		} else if (campaign.chain === Chains.ETHEREUM) {
			rewardContractAddressUrl = `${ETHEREUM_EXPLORER_ADDRESS_URL}${campaign.reward.address}`;
		}
	}

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
				allowZeroExpanded={true}
				allowMultipleExpanded={true}
				className={css`
					.accordion__button {
						position: relative;
						display: flex;
						align-items: center;
						// FIXME: This is a bug in linaria. Once solved let's use the commented out line below instead
						// for all these cases
						//background-color: \${colors.gray75};
						background-color: #f9fafc;
						transition: background-color 0.1s;

						:hover {
							background-color: #edeff5;
							//background-color: \${colors.gray200};
						}

						:before {
							position: absolute;
							right: 10px;
						}
					}

					.accordion__panel {
						padding: 20px;
						//background-color: \${colors.gray75};
						//border-top: 1px solid \${colors.gray500};
						background-color: #f9fafc;
						border-top: 1px solid #c1c4d6;

						[hidden] {
							border-top: none !important;
						}
					}

					.accordion__item {
						border: 1px solid #c1c4d6;
						// border: 1px solid \${colors.gray500};
						margin-bottom: 6px;
						border-radius: 8px;
						overflow: hidden;
					}
				`}
			>
				<AccordionItem
					uuid="terms"
					className={cx(
						"accordion__item",
						css`
							border: 1px solid #3366ff !important;
							// border: 1px solid \${colors.blue500} !important;
						`
					)}
				>
					<AccordionItemHeading>
						<AccordionItemButton
							className={cx(
								`accordion__button`,
								css`
									background-color: #ebf0ff !important;
									// background-color: \${colors.blue50} !important;

									:before {
										color: #3366ff !important;
										//color: \${colors.blue500} !important;
									}

									:hover {
										background-color: #d6e0ff !important;
										//background-color: \${colors.blue100} !important;
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
								border-top: 1px solid #3366ff !important;
								//border-top: 1px solid \${colors.blue500} !important;

								[hidden] {
									border-top: none !important;
								}
							`
						)}
					>
						<UnorderedList marginY={-8}>
							<ListItem>
								Rewards are paid in{" "}
								<Strong>
									{name} ({ticker})
								</Strong>
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
							<Pane paddingTop={20}>
								<Pane
									borderTop="1px solid rgba(0, 0, 0, 0.1)"
									paddingTop={10}
									display="flex"
									flexDirection="row"
									alignItems="center"
								>
									<Anchor
										href={campaign.details.externalLink}
										external
										marginRight={6}
									>
										<Strong color="inherit" fontSize="inherit">
											For more information, learn more
										</Strong>
									</Anchor>
									<UilExternalLinkAlt size={18} color={colors.blue500} />
								</Pane>
							</Pane>
						)}
					</AccordionItemPanel>
				</AccordionItem>
				<AccordionItem uuid="details">
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
								<UilNotes size={28} color={colors.gray900} />
								<Heading is="h5" size={600} margin={0} marginLeft={8}>
									Reward Details
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

								> div {
									display: flex;
									flex-direction: row;
									justify-content: space-between;
									margin-bottom: 10px;

									:last-child {
										margin-bottom: 0;
									}

									label,
									a {
										font-size: inherit;
									}

									label {
										opacity: 0.8;
									}
								}
							`
						)}
					>
						{rewardContractAddressUrl && campaign.reward.address && (
							<Pane>
								<Label>Contract Address</Label>
								<Anchor href={rewardContractAddressUrl} external>
									<Strong color="inherit">
										{truncate(campaign.reward.address, 8, 4)}
									</Strong>
								</Anchor>
							</Pane>
						)}
						<Pane>
							<Label>Token Standard</Label>
							<Label>
								{campaign.reward.type === RewardTypes.TOKEN
									? "Native"
									: campaign.reward.type.toUpperCase()}
							</Label>
						</Pane>
						<Pane>
							<Label>Token Ticker</Label>
							<Label>{ticker}</Label>
						</Pane>
						<Pane>
							<Label>Blockchain</Label>
							<Label>{pascalCase(campaign.chain)}</Label>
						</Pane>
					</AccordionItemPanel>
				</AccordionItem>
			</Accordion>
			<Text
				marginX={"auto"}
				display={"flex"}
				justifyContent={"center"}
				size={300}
				color={colors.gray700}
				marginTop={12}
			>
				Powered by Usher — alpha release. Please refer responsibly.
			</Text>
		</Pane>
	);
};

export default CampaignInfoAccordions;
