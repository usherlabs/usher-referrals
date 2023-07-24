import React, { useCallback } from "react";
import { Heading, HelpIcon, Pane, Paragraph, Tooltip } from "evergreen-ui";
import { css } from "@linaria/core";

import { Partnership } from "@usher.so/partnerships";
import { PartnershipMetrics } from "@/types";
import InviteLink from "@/components/InviteLink";
import Metric from "@/components/Metric";
import getInviteLink from "@/utils/get-invite-link";
import * as mediaQueries from "@/utils/media-queries";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = {
	partnership: Partnership;
	metrics: {
		isLoading: boolean;
		data: PartnershipMetrics | null;
	};
};

const CampaignPartnership: React.FC<Props> = ({ partnership, metrics }) => {
	const { colors } = useCustomTheme();

	// "Users converted by the Advertiser that are pending for processing."
	const ConvHelpIcon = (content: string) =>
		useCallback(
			(props: any) => (
				<Tooltip content={content} statelessProps={{ minWidth: 340 }}>
					<HelpIcon {...props} />
				</Tooltip>
			),
			[content]
		);

	return (
		<>
			<Pane paddingBottom={12}>
				<Heading is="h4" size={700} paddingY={12}>
					Invite Link
				</Heading>
				<Pane
					padding={12}
					background="tint2"
					borderRadius={8}
					marginBottom={12}
				>
					<Pane display="flex" flexDirection="column">
						<InviteLink
							link={getInviteLink(partnership.id)}
							marginBottom={12}
						/>
						<Pane
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="space-between"
						>
							<Paragraph width="100%">
								👆&nbsp;&nbsp;Click and Copy to share the Invite link and earn
							</Paragraph>
						</Pane>
					</Pane>
				</Pane>
			</Pane>
			<Pane>
				<Heading is="h4" size={700} paddingY={12}>
					Overview
				</Heading>
				<Pane
					padding={12}
					marginBottom={12}
					background="tint2"
					borderRadius={8}
				>
					<Pane
						display="table"
						flexDirection={"row"}
						width="100%"
						justifyContent="space-between"
						alignItems="center"
						className={css`
							> div {
								border-right: 1px solid rgba(0, 0, 0, 0.1);
								width: 33%;
								display: table-cell;

								&:last-child {
									border-right: none !important;
									border-bottom: none !important;
								}
							}

							${mediaQueries.isSmall} {
								display: flex;
								flex-direction: column !important;

								> div {
									width: 100%
									display: block;
									border-right: none !important;
									border-bottom: 1px solid rgba(0, 0, 0, 0.1);
								}
							}
						`}
					>
						<Metric
							value={metrics.data ? metrics.data.hits : ""}
							id="total-referrals"
							label="Link Hits"
							isLoading={metrics.isLoading}
						/>
						<Metric
							value={metrics.data ? metrics.data.conversions.pending : ""}
							id="pending-conv-count"
							label="Pending Conversions"
							iconRight={ConvHelpIcon(
								"Conversions that have been indexed but are yet to be validated."
							)}
							iconProps={{
								color: colors.gray500
							}}
							isLoading={metrics.isLoading}
						/>
						<Metric
							value={metrics.data ? metrics.data.conversions.successful : ""}
							id="success-conv-count"
							label="Successful Conversions"
							iconRight={ConvHelpIcon(
								"Conversions that have been validated and have rewards allocated."
							)}
							iconProps={{
								color: colors.gray500
							}}
							isLoading={metrics.isLoading}
						/>
					</Pane>
				</Pane>
			</Pane>
		</>
	);
};

export default CampaignPartnership;
