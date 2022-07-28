import React from "react";
import { Pane } from "evergreen-ui";
import { css } from "@linaria/core";
import Image from "next/image";

import { Campaign } from "@/types";
import { useRandomColor } from "@/hooks";

export type Props = {
	campaign: Campaign;
};

const CampaignBanner: React.FC<Props> = ({ campaign }) => {
	const rColor = useRandomColor();

	return (
		<Pane
			borderBottom
			height={200}
			backgroundImage={`url(${campaign.details.image})`}
			backgroundPosition="center"
			backgroundSize="cover"
			backgroundColor={rColor}
			backgroundRepeat="no-repeat"
			boxShadow="inset 0 -18px 58px rgba(0, 0, 0, 0.1)"
			position="relative"
			borderBottomLeftRadius={12}
			borderBottomRightRadius={12}
			width="100%"
		>
			{campaign.advertiser.icon && (
				<Pane
					borderRadius={12}
					boxShadow="0 5px 15px rgba(0, 0, 0, 0.15)"
					backgroundSize="contain"
					backgroundRepeat="no-repeat"
					backgroundPosition="center"
					border="5px solid #fff"
					backgroundColor="#fff"
					position="absolute"
					left={16}
					bottom={16}
				>
					<Image
						src={campaign.advertiser.icon}
						height={60}
						width={150}
						className={css`
							object-fit: contain;
						`}
					/>
				</Pane>
			)}
		</Pane>
	);
};

export default CampaignBanner;
