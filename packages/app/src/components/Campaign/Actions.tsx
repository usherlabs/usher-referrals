import React from "react";
import { Button, Pane, Tooltip } from "evergreen-ui";
import Image from "next/image";

import { Chains, Campaign } from "@/types";
import Anchor from "@/components/Anchor";
import { UilTwitter } from "@iconscout/react-unicons";
import ArweaveIcon from "@/assets/icon/arweave-icon.png";

export type Props = {
	chain: Chains;
	campaign: Campaign;
};

const CampaignActions: React.FC<Props> = ({ chain, campaign }) => {
	return (
		<>
			{campaign.advertiser.twitter && (
				<Pane marginRight={12}>
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
			<Pane>
				<Tooltip content="View on Arweave">
					<Pane>
						<Anchor href={`https://arweave.net/${campaign.id}`} external>
							<Button borderRadius={100} height={50} width={50} padding={0}>
								<Image src={ArweaveIcon} height={28} width={28} />
							</Button>
						</Anchor>
					</Pane>
				</Tooltip>
			</Pane>
		</>
	);
};

export default CampaignActions;
