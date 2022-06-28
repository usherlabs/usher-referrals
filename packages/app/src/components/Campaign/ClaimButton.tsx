import React, { useState } from "react";
import {
	Paragraph,
	Button,
	Strong,
	majorScale,
	Pane,
	Dialog,
	useTheme,
	LockIcon,
	ButtonProps,
	Heading,
	Alert,
	ExpandAllIcon,
	SelectMenu
} from "evergreen-ui";
import Image from "next/image";
import { css } from "@linaria/core";

import { Wallet, CampaignReward, Chains, Connections } from "@/types";
import ValueCard from "@/components/ValueCard";
import Anchor from "@/components/Anchor";
import { chainImages, connectionImages } from "@/utils/connections-map";
import { UilWallet, UilCoins } from "@iconscout/react-unicons";

export type Props = {
	onClaim: (() => Promise<void>) | (() => void);
	wallets: Wallet[];
	amount: number;
	reward: CampaignReward;
	isClaiming?: boolean;
	processed?: number; // How much of the limit has been processed
	active?: boolean; // Determined by whether the limit has been reached
	buttonProps?: ButtonProps;
};

const ClaimButton: React.FC<Props> = ({
	onClaim,
	isClaiming = false,
	wallets,
	amount,
	reward,
	processed = 0,
	active = false,
	buttonProps
}) => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets[0]);
	const isActive = active && amount > 0;
	const isComplete =
		reward.limit && reward.limit > 0 ? processed >= reward.limit : false;

	if (isComplete) {
		return (
			<Alert
				title="This campaign has finished"
				intent="success"
				className={css`
					h4 {
						font-size: 1em;
						margin: 1px 0 10px 0;
					}
					svg {
						height: 20px;
						width: 20px;
					}
				`}
			>
				<Paragraph>All rewards for this campaign has been claimed!</Paragraph>
				<Paragraph>
					To explore more campaigns like this,{" "}
					<Anchor href="/explore">
						<Strong color={colors.blue500} textDecoration="underline">
							start exploring
						</Strong>
					</Anchor>
				</Paragraph>
			</Alert>
		);
	}

	const WalletCard = (
		<ValueCard
			value={selectedWallet.address}
			id="destination-wallet"
			iconLeft={() => (
				<Image
					src={connectionImages[selectedWallet.connection]}
					width={25}
					height={25}
				/>
			)}
			background="none"
			{...(wallets.length > 0
				? {
						iconRight: () => <ExpandAllIcon size={25} />,
						className: css`
							&:hover {
								background-color: rgba(0, 0, 0, 0.1);
								cursor: pointer;
							}
						`
				  }
				: {})}
		/>
	);

	return (
		<>
			<Button
				height={majorScale(6)}
				intent="success"
				appearance="primary"
				minWidth={260}
				width="100%"
				{...buttonProps}
				iconBefore={isActive ? () => <UilCoins size="28" /> : LockIcon}
				onClick={isActive ? () => setShowDialog(true) : () => null}
				pointerEvents={isActive ? "auto" : "none"}
			>
				<Strong color="inherit" fontSize="1.1em">
					Claim Rewards
				</Strong>
			</Button>
			<Dialog
				isShown={showDialog}
				title="💸  Claim your Rewards"
				onCloseComplete={() => setShowDialog(false)}
				hasFooter={false}
			>
				<Pane position="relative" paddingBottom={majorScale(7) + 20}>
					<Pane
						display="flex"
						alignItems="center"
						marginBottom={24}
						flexDirection="column"
					>
						<Heading is="h4" size={900}>
							{amount} {reward.ticker.toUpperCase()}
						</Heading>
						<Paragraph size={500}>will be paid to</Paragraph>
						{wallets.length > 0 ? (
							<SelectMenu
								options={wallets
									.filter((w) => w.address !== selectedWallet.address)
									.map((w) => ({
										label: w.address,
										value: w.address,
										icon: connectionImages[w.connection]
									}))}
								selected={selectedWallet.address}
								hasFilter={false}
								hasTitle={false}
								onSelect={(item) =>
									setSelectedWallet(
										wallets.find((w) => w.address === item.value) || wallets[0]
									)
								}
							>
								{WalletCard}
							</SelectMenu>
						) : (
							WalletCard
						)}
					</Pane>
					{selectedWallet.chain === Chains.ARWEAVE && (
						<Pane
							display="flex"
							alignItems="flex-start"
							flexDirection="row"
							marginBottom={16}
							paddingTop={16}
							borderTop
						>
							<Image
								src={chainImages[selectedWallet.chain]}
								width={100}
								height={100}
							/>
							<Pane marginLeft={16}>
								<Paragraph size={500} marginTop={0} marginBottom={8}>
									<Strong fontSize="inherit">Arweave</Strong> Blockchain rewards
									may take up to 20 minutes to process.
								</Paragraph>
								<Paragraph size={500} marginY={0}>
									You will receive a notification once your funds have been
									deposited into your wallet.
								</Paragraph>
							</Pane>
						</Pane>
					)}
					{selectedWallet.connection === Connections.MAGIC && (
						<Pane
							display="flex"
							alignItems="center"
							flexDirection="row"
							marginBottom={16}
							paddingTop={16}
							borderTop
						>
							<Pane
								display="flex"
								alignItems="center"
								padding={12}
								backgroundColor={colors.gray100}
								borderRadius={8}
							>
								<UilWallet size="45" color={colors.gray800} />
							</Pane>
							<Pane marginLeft={16}>
								<Paragraph size={500} marginTop={0} marginBottom={8}>
									<Strong fontSize="inherit">
										I have a Magic Wallet! What to do next?
									</Strong>
								</Paragraph>
								<Paragraph size={500} marginY={0}>
									Click the Wallet Icon in the Menu to send your funds to an
									Exchange or to another wallet.
								</Paragraph>
							</Pane>
						</Pane>
					)}
					<Button
						height={majorScale(7)}
						appearance="primary"
						onClick={onClaim}
						minWidth={250}
						position="fixed"
						left={10}
						right={10}
						bottom={10}
						isLoading={isClaiming}
					>
						<Strong color="#fff" fontSize="1.1em">
							👉&nbsp;&nbsp;Claim Rewards
						</Strong>
					</Button>
				</Pane>
			</Dialog>
		</>
	);
};

export default ClaimButton;
