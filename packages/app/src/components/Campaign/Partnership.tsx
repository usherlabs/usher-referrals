import React, { useCallback } from "react";
import {
	Heading,
	Pane,
	Paragraph,
	useTheme,
	Tooltip,
	HelpIcon
} from "evergreen-ui";
import { css } from "@linaria/core";

import { Partnership, PartnershipMetrics } from "@/types";
import InviteLink from "@/components/InviteLink";
import ValueCard from "@/components/ValueCard";
import getInviteLink from "@/utils/get-invite-link";
import * as mediaQueries from "@/utils/media-queries";

export type Props = {
	partnership: Partnership;
	metrics: {
		isLoading: boolean;
		data: PartnershipMetrics | null;
	};
};

const CampaignPartnership: React.FC<Props> = ({ partnership, metrics }) => {
	const { colors } = useTheme();

	// "Users converted by the Advertiser that are pending for processing."
	const ConvHelpIcon = (content: string) =>
		useCallback(
			(props: any) => (
				<Tooltip content={content} statelessProps={{ minWidth: 340 }}>
					<HelpIcon {...props} />
				</Tooltip>
			),
			[]
		);

	return (
		<>
			<Pane padding={12} background="tint2" borderRadius={8} marginBottom={12}>
				<Pane display="flex" flexDirection="column">
					<InviteLink link={getInviteLink(partnership.id)} marginBottom={12} />
					<Pane
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="space-between"
					>
						<Paragraph width="100%">
							👆&nbsp;&nbsp;Click and Copy to share the Usher Invite link and
							earn
						</Paragraph>
					</Pane>
				</Pane>
			</Pane>
			<Pane>
				<Heading is="h4" size={500} paddingY={12}>
					Overview
				</Heading>
				<Pane
					padding={12}
					marginBottom={12}
					background="tint2"
					borderRadius={8}
				>
					<Pane display="flex" marginBottom={24}>
						<ValueCard
							value={metrics.data ? metrics.data.hits : ""}
							ticker="hits"
							id="total-referrals"
							label="Link Hits"
							isLoading={metrics.isLoading}
						/>
					</Pane>
					<Pane
						display="flex"
						flexDirection={"row"}
						width="100%"
						className={css`
							${mediaQueries.isMedium} {
								flex-direction: column !important;
							}
						`}
					>
						<Pane display="flex" flex={1}>
							<ValueCard
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
						</Pane>
						<Pane width={20} />
						<Pane display="flex" flex={1}>
							<ValueCard
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
			</Pane>
		</>
	);
};

export default CampaignPartnership;
