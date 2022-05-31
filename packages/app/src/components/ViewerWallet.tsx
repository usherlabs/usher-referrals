/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import {
	Pane,
	Button,
	Menu,
	PaneProps,
	ChevronDownIcon,
	Popover,
	Strong,
	Tooltip
} from "evergreen-ui";
import Image from "next/image";

import truncate from "@/utils/truncate";
import { Chains } from "@/types";
import useViewerWallet from "@/hooks/use-viewer-wallet";
import { useUser } from "@/hooks";
import { connectionImages } from "@/utils/connections-map";

export type Props = PaneProps & {
	chain: Chains;
};

const ViewerWallet: React.FC<Props> = ({ chain, ...props }) => {
	const {
		user: { wallets }
	} = useUser();
	const walletsForChain = wallets.filter((wallet) => wallet.chain === chain);
	const [viewerWallet, setPreferredWallet] = useViewerWallet(chain);

	if (!viewerWallet) {
		return null;
	}

	// const onSetViewerWallet = useCallback((wallet: Wallet) => {
	// 	setPreferredWallet(wallet.address);
	// }, [])

	const WalletButton = (
		<Button
			borderRadius={40}
			iconAfter={walletsForChain.length > 1 ? ChevronDownIcon : null}
			display="flex"
			alignItems="center"
			{...props}
		>
			<Pane display="flex" alignItems="center" marginRight={8}>
				<Image
					src={connectionImages[viewerWallet.connection]}
					width={25}
					height={25}
				/>
			</Pane>
			<Strong>{truncate(viewerWallet.address, 6, 4)}</Strong>
		</Button>
	);

	return (
		<Pane display="flex" flexDirection="row" alignItems="center">
			<Tooltip content="Select the wallet to engage this partnership with.">
				<Strong marginRight={8}>Viewing as</Strong>
			</Tooltip>
			{walletsForChain.length > 1 ? (
				<Popover
					content={
						<Menu>
							<Menu.Group>
								{walletsForChain
									.filter((wallet) => wallet.address !== viewerWallet.address)
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
												onClick={() => setPreferredWallet(wallet.address)}
											>
												{truncate(wallet.address, 6, 4)}
											</Menu.Item>
										);
									})}
							</Menu.Group>
						</Menu>
					}
				>
					{WalletButton}
				</Popover>
			) : (
				WalletButton
			)}
		</Pane>
	);
};

export default ViewerWallet;
