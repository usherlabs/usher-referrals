import React from "react";
import {
	Button,
	majorScale,
	Strong,
	Pane,
	Paragraph,
	useTheme
} from "evergreen-ui";
import startCase from "lodash/startCase";

import { Chains } from "@usher.so/shared";

export type Props = {
	chain: Chains;
	onStart: (() => Promise<void>) | (() => void);
	hasWallets?: boolean;
	isLoading?: boolean;
};

const CampaignStartPartnership: React.FC<Props> = ({
	chain,
	onStart,
	hasWallets = true,
	isLoading = false
}) => {
	const { colors } = useTheme();

	const buttonProps = {
		height: majorScale(7),
		appearance: "primary",
		minWidth: 250,
		isLoading
	};
	const ButtonChild = (
		<Strong color="#fff" fontSize="1.1em">
			👉&nbsp;&nbsp;Start a Partnership
		</Strong>
	);

	return (
		<Pane
			border
			borderRadius={8}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			height={300}
			background="tint2"
		>
			<Button onClick={() => onStart()} {...buttonProps}>
				{ButtonChild}
			</Button>
			{!hasWallets && (
				<Paragraph
					marginTop={8}
					textAlign="center"
					fontSize="1.1em"
					opacity="0.8"
					color={colors.gray900}
				>
					Connect a wallet for the {startCase(chain)} blockchain
				</Paragraph>
			)}
		</Pane>
	);
};

export default CampaignStartPartnership;
