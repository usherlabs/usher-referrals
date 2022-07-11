import React, { useEffect, useState } from "react";
import { UilCoins } from "@iconscout/react-unicons";
import { useTheme, Tooltip, Pane } from "evergreen-ui";

import { Campaign, Chains } from "@/types";
import ValueCard from "@/components/ValueCard";
import { getArweaveClient } from "@/utils/arweave-client";

const arweave = getArweaveClient();

export type Props = {
	campaign: Campaign;
};

const CampaingFunding: React.FC<Props> = ({ campaign }) => {
	const [isLoading, setLoading] = useState(true);
	const [funding, setFunding] = useState("0");
	const { colors } = useTheme();

	useEffect(() => {
		if (!campaign.id) {
			return () => {};
		}

		(async () => {
			if (campaign.chain === Chains.ARWEAVE) {
				const balance = await arweave.wallets.getBalance(campaign.id);
				const arBalance = arweave.ar.winstonToAr(balance);
				const f = parseFloat(arBalance).toFixed(6);
				setFunding(f);
			}

			setLoading(false);
		})();
		return () => {};
	}, [campaign]);

	return (
		<Tooltip content="The campaign's active collateral for partners to earn">
			<Pane>
				<ValueCard
					value={!isLoading ? funding : ""}
					ticker={campaign.reward.ticker}
					id="campaign funding"
					label="Campaign Funds"
					isLoading={isLoading}
					iconLeft={() => <UilCoins size={28} color={colors.gray700} />}
				/>
			</Pane>
		</Tooltip>
	);
};

export default CampaingFunding;
