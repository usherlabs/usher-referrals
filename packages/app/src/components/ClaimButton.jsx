import React from "react";
import {
	Button,
	majorScale,
	DoubleChevronDownIcon,
	Tooltip,
	Strong
} from "evergreen-ui";

const ClaimButton = ({ ...props }) => {
	return (
		<Tooltip
			content="This feature is in development. Referrals are still recorded for when this feature is ready!"
			statelessProps={{
				minWidth: 340
			}}
		>
			<Button
				height={majorScale(6)}
				intent="success"
				appearance="primary"
				iconBefore={DoubleChevronDownIcon}
				minWidth={260}
				width="100%"
				{...props}
			>
				<Strong color="inherit">Claim Rewards</Strong>
			</Button>
		</Tooltip>
	);
};

export default ClaimButton;
