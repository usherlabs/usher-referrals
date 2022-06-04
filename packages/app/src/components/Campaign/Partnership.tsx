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

import { Partnership } from "@/types";
import AffiliateLink from "@/components/AffiliateLink";
import ValueCard from "@/components/ValueCard";
import getInviteLink from "@/utils/get-invite-link";

export type Props = {
	partnership: Partnership;
};

const CampaignPartnership: React.FC<Props> = ({ partnership }) => {
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
					<AffiliateLink
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
							👆&nbsp;&nbsp;Click and Copy to share this Affiliate link and earn
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
							// value={conversions.total}
							value=""
							ticker="hits"
							id="total-referrals"
							label="Affiliate Link Hits"
							isLoading
						/>
					</Pane>
					<Pane
						display="flex"
						flexDirection="row"
						width="100%"
						// className={css`
						// 	@media (max-width: 767px) {
						// 		flexdirection: column !important;
						// 	}
						// `}
					>
						<Pane display="flex" flex={1}>
							<ValueCard
								// value={conversions.pending}
								value=""
								id="pending-conv-count"
								label="Pending Conversions"
								iconRight={ConvHelpIcon(
									"Pending Conversions are referrals that have been converted to users on the advertising partner's application. These are considered pending as conversions are yet to have associated rewards allocated."
								)}
								iconProps={{
									color: colors.gray500
								}}
								isLoading
							/>
						</Pane>
						<Pane width={20} />
						<Pane display="flex" flex={1}>
							<ValueCard
								// value={conversions.success}
								value=""
								id="success-conv-count"
								label="Successful Conversions"
								iconRight={ConvHelpIcon(
									"Successful Conversions are converted referrals where rewards are guaranteed for the Affiliate."
								)}
								iconProps={{
									color: colors.gray500
								}}
								isLoading
							/>
						</Pane>
					</Pane>
				</Pane>
			</Pane>
		</>
	);
};

export default CampaignPartnership;
