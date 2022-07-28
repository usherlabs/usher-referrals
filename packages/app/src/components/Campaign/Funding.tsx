import React from "react";
import { UilCoins } from "@iconscout/react-unicons";
import {
	useTheme,
	Tooltip,
	Pane
	// Text, Strong
} from "evergreen-ui";

import ValueCard from "@/components/ValueCard";
// import { CampaignReward, RewardTypes, Chains } from "@/types";
// import Anchor from "../Anchor";

export type Props = {
	balance: number;
	// chain: Chains;
	// reward: CampaignReward;
	ticker: string;
	loading?: boolean;
};

const CampaingFunding: React.FC<Props> = ({
	balance,
	// chain,
	// reward,
	ticker,
	loading = false
}) => {
	const { colors } = useTheme();

	// let AddressLink = null;
	// if (reward.address) {
	// 	if (chain === Chains.ARWEAVE) {
	// 		AddressLink = (
	// 			<Anchor href={`https://viewblock.io/arweave/address/${reward.address}`}>
	// 				View on ViewBlock
	// 			</Anchor>
	// 		);
	// 	}
	// }

	return (
		<Tooltip content="The campaign's active collateral for partners to earn">
			<Pane>
				<ValueCard
					value={!loading ? parseFloat(balance.toFixed(6)) : ""}
					ticker={ticker}
					id="campaign funding"
					label="Campaign Funds"
					isLoading={loading}
					iconLeft={() => <UilCoins size={28} color={colors.gray700} />}
				/>
			</Pane>
			{/* {reward.address && reward.type !== RewardTypes.TOKEN && (
				<Pane marginTop={12} display="flex" flexDirection="row">
					<Pane>
						<Text>
							Type: <Strong>{reward.type.toUpperCase()}</Strong>
						</Text>
					</Pane>
					<Pane>{AddressLink}</Pane>
				</Pane>
			)} */}
		</Tooltip>
	);
};

export default CampaingFunding;
