import React from "react";
import { UilCoins } from "@iconscout/react-unicons";

import MetricCard from "@/components/MetricCard";
import { useCustomTheme } from "@/brand/themes/theme";
import { atom, useAtomValue } from "jotai";

export type Props = {
	balance: number;
	ticker: string;
};

export const campaignFundsAtoms = {
	loading: atom(true)
};

const CampaignFunds: React.FC<Props> = ({ balance, ticker }) => {
	const { colors } = useCustomTheme();
	const loading = useAtomValue(campaignFundsAtoms.loading);

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
