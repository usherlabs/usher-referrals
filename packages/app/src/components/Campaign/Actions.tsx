import React from "react";
import { Button, Pane, Tooltip } from "evergreen-ui";
import Image from "next/image";

import { Campaign } from "@/types";
import Anchor from "@/components/Anchor";
import { UilTwitter } from "@iconscout/react-unicons";
import ArweaveIcon from "@/assets/icon/arweave-icon.png";

export type Props = {
	campaign: Campaign;
};

const CampaignActions: React.FC<Props> = ({ campaign }) => {
	return (
		<>
			<Pane marginX={6}>
				<Tooltip content="View on Arweave">
					<Pane>
						<Anchor
							href={`https://viewblock.io/arweave/address/${campaign.id}`}
							external
						>
							<Button borderRadius={100} height={50} width={50} padding={0}>
								<Image src={ArweaveIcon} height={28} width={28} />
							</Button>
						</Anchor>
					</Pane>
				</Tooltip>
			</Pane>
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
