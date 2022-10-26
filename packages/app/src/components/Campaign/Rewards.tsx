import React from "react";
import { useTheme, Tooltip, Text } from "evergreen-ui";
import { UilAwardAlt } from "@iconscout/react-unicons";

import MetricCard from "@/components/MetricCard";

export type Props = {
	value: number;
	ticker: string;
	excess?: number;
	loading?: boolean;
};

const CampaignRewards: React.FC<Props> = ({
	value,
	ticker,
	excess = 0,
	loading = false
}) => {
	const { colors } = useTheme();

	return (
		<MetricCard
			isLoading={loading}
			ticker={ticker}
			value={
				<>
					{parseFloat(value.toFixed(6))}
					{!!excess && (
						<Tooltip content="You have earned excess rewards!">
							<Text color={colors.blue500} marginLeft={4}>
								+{excess}
							</Text>
						</Tooltip>
					)}
				</>
			}
			id="claimable-rewards"
			label="Claimable Rewards"
			topLabel="Rewards the partners can withdraw"
			iconLeft={() => <UilAwardAlt size={28} color={colors.gray700} />}
			width="100%"
		/>
	);
};

export default CampaignRewards;
