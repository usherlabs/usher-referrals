import React from "react";
import { UilCoins } from "@iconscout/react-unicons";
import { useTheme } from "evergreen-ui";

import MetricCard from "@/components/MetricCard";
// import { CampaignReward, RewardTypes, Chains } from "@/types";
// import Anchor from "../Anchor";

export type Props = {
	balance: number;
	// chain: Chains;
	// reward: CampaignReward;
	ticker: string;
	loading?: boolean;
};

const CampaignFunds: React.FC<Props> = ({
	balance,
	// chain,
	// reward,
	ticker,
	loading = false
}) => {
	const { colors } = useTheme();

	return (
		<MetricCard
			value={!loading ? parseFloat(balance.toFixed(6)) : ""}
			ticker={ticker}
			id="campaign funding"
			label="Campaign Funds"
			topLabel="Active collateral for partners to earn"
			isLoading={loading}
			iconLeft={() => <UilCoins size={28} color={colors.gray700} />}
		/>
	);
};

export default CampaignFunds;
