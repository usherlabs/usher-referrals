/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import {
	Button,
	ButtonProps,
	ChevronDownIcon,
	Menu,
	Pane,
	Popover,
	Strong,
	Tooltip
} from "evergreen-ui";
import Image from "next/image";

import truncate from "@/utils/truncate";
import { Wallet } from "@usher.so/shared";
import { connectionImages } from "@/utils/images-map";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = {
	selected: Wallet;
	options: Wallet[];
	onSelect: (wallet: Wallet) => void;
	buttonProps?: ButtonProps;
};

const ViewerWallet: React.FC<Props> = ({
	selected,
	options,
	onSelect,
	buttonProps = {}
}) => {
	const { colors } = useCustomTheme();

	const SelectedWallet = (
		<Pane display="flex" alignItems="center">
			<Pane display="flex" alignItems="center" marginRight={8}>
				<Image
					src={connectionImages[selected.connection]}
					width={25}
					height={25}
				/>
			</Pane>
			<Strong>{truncate(selected.address, 6, 4)}</Strong>
		</Pane>
	);

	return (
		<Pane display="flex" flexDirection="row" alignItems="center">
			{options.length > 1 ? (
				<>
					<Tooltip content="Select the partnered wallet you would like to view this partnership with.">
						<Strong marginRight={8}>Viewing as</Strong>
					</Tooltip>
					<Popover
						content={
							<Menu>
								<Menu.Group>
									{options
										.filter((wallet) => wallet.address !== selected.address)
										.map((wallet) => {
											return (
												<Menu.Item
													key={wallet.address}
													icon={() => (
														<Image
															src={connectionImages[wallet.connection]}
															height={25}
															width={25}
														/>
													)}
													onClick={() => onSelect(wallet)}
												>
													{truncate(wallet.address, 6, 4)}
												</Menu.Item>
											);
										})}
								</Menu.Group>
							</Menu>
						}
					>
						<Button
							borderRadius={40}
							iconAfter={options.length > 1 ? ChevronDownIcon : null}
							{...buttonProps}
						>
							{SelectedWallet}
						</Button>
					</Popover>
				</>
			) : (
				<>
					<Tooltip content="The wallet you selected to partner with this Campaign.">
						<Strong marginRight={8}>Viewing as</Strong>
					</Tooltip>
					<Button
						borderRadius={40}
						appearance="minimal"
						{...buttonProps}
						pointerEvents="none"
						backgroundColor={colors.gray100}
					>
						{SelectedWallet}
					</Button>
				</>
			)}
		</Pane>
	);
};

export default ViewerWallet;
