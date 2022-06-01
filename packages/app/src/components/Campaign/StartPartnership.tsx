import React from "react";
import {
	Button,
	majorScale,
	Strong,
	Pane,
	Paragraph,
	useTheme,
	Menu,
	Popover,
	ChevronDownIcon
} from "evergreen-ui";
import startCase from "lodash/startCase";
import Image from "next/image";

import { Chains, Wallet } from "@/types";
import { connectionImages } from "@/utils/connections-map";
import truncate from "@/utils/truncate";

export type Props = {
	chain: Chains;
	onStart: ((selected: Wallet | null) => Promise<void>) | (() => void);
	wallets: Wallet[];
	isLoading?: boolean;
};

const CampaignStartPartnership: React.FC<Props> = ({
	chain,
	onStart,
	wallets,
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
			{wallets.length > 1 ? (
				<Popover
					content={
						<Menu>
							<Menu.Group title={`with ${chain} wallet`}>
								{wallets.map((wallet) => (
									<Menu.Item
										key={wallet.address}
										icon={() => (
											<Image
												src={connectionImages[wallet.connection]}
												width={20}
												height={20}
											/>
										)}
										onClick={() => onStart(wallet)}
									>
										{truncate(wallet.address, 6, 4)}
									</Menu.Item>
								))}
							</Menu.Group>
						</Menu>
					}
				>
					<Button iconAfter={ChevronDownIcon} {...buttonProps}>
						{ButtonChild}
					</Button>
				</Popover>
			) : (
				<Button
					onClick={() => onStart(wallets.length > 0 ? wallets[0] : null)}
					{...buttonProps}
				>
					{ButtonChild}
				</Button>
			)}
			{wallets.length === 0 && (
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
