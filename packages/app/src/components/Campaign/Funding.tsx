import React from "react";
import { UilCoins } from "@iconscout/react-unicons";
import { useTheme, Tooltip, Pane } from "evergreen-ui";

import ValueCard from "@/components/ValueCard";

export type Props = {
	balance: number;
	ticker: string;
	loading?: boolean;
};

const CampaingFunding: React.FC<Props> = ({
	balance,
	ticker,
	loading = false
}) => {
	const { colors } = useTheme();

	return (
		<Tooltip content="The campaign's active collateral for partners to earn">
			<Pane>
				<ValueCard
					value={!loading ? balance.toFixed(6) : ""}
					ticker={ticker}
					id="campaign funding"
					label="Campaign Funds"
					isLoading={loading}
					iconLeft={() => <UilCoins size={28} color={colors.gray700} />}
				/>
			</Pane>
		</Tooltip>
	);
};

export default CampaingFunding;
