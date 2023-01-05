import { Button, Pane, Tooltip } from "evergreen-ui";
import Image from "next/image";
import React, { useMemo } from "react";

import Anchor from "@/components/Anchor";
import {
	ARWEAVE_EXPLORER_ADDRESS_URL,
	ETHEREUM_EXPLORER_ADDRESS_URL
} from "@/constants";
import { Chains } from "@usher.so/shared";
import { Campaign } from "@usher.so/campaigns";
import { chainImages } from "@/utils/images-map";
import { UilTwitter } from "@iconscout/react-unicons";

export type Props = {
	campaign: Campaign;
};

const CampaignActions: React.FC<Props> = ({ campaign }) => {
	const explorer = useMemo(() => {
		switch (campaign.chain) {
			case Chains.ARWEAVE:
				return {
					tooltip: "View on Arweave",
					icon: chainImages[campaign.chain],
					url: `${ARWEAVE_EXPLORER_ADDRESS_URL}${campaign.id}`
				};
			case Chains.ETHEREUM:
				return {
					tooltip: "View on Etherscan",
					icon: chainImages[campaign.chain],
					url: `${ETHEREUM_EXPLORER_ADDRESS_URL}${campaign.id}`
				};
			default:
				return null;
		}
	}, [campaign]);

	return (
		<>
			{explorer && (
				<Pane marginX={6}>
					<Tooltip content={explorer.tooltip}>
						<Pane>
							<Anchor href={explorer.url} external>
								<Button borderRadius={100} height={50} width={50} padding={0}>
									<Image src={explorer.icon} height={28} width={28} />
								</Button>
							</Anchor>
						</Pane>
					</Tooltip>
				</Pane>
			)}
			{campaign.advertiser.twitter && (
				<Pane marginX={6}>
					<Tooltip content="Twitter">
						<Pane>
							<Anchor href={campaign.advertiser.twitter} external>
								<Button borderRadius={100} height={50} width={50} padding={0}>
									<UilTwitter size="28" />
								</Button>
							</Anchor>
						</Pane>
					</Tooltip>
				</Pane>
			)}
		</>
	);
};

export default CampaignActions;
