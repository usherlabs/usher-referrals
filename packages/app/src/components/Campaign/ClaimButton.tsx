import React, { useCallback, useState } from "react";
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
	ChevronDownIcon,
	SelectMenu
} from "evergreen-ui";
import Image from "next/image";
import { css } from "@linaria/core";

import { Wallet, CampaignReward, Chains, Connections } from "@/types";
import ValueCard from "@/components/ValueCard";
import Anchor from "@/components/Anchor";
import { chainImages, connectionImages } from "@/utils/images-map";
import { UilWallet, UilArrowCircleDown } from "@iconscout/react-unicons";
import truncate from "@/utils/truncate";
import InputField from "@/components/InputField";

export type Props = {
	onClaim: (wallet: Wallet) => Promise<void> | void;
	wallets: Wallet[];
	amount: number;
	reward: CampaignReward;
	isClaiming?: boolean;
	processed?: number; // How much of the limit has been processed
	active?: boolean; // Determined by whether the limit has been reached
	buttonProps?: ButtonProps;
	tx?: { id: string; url: string };
};

const ClaimButton: React.FC<Props> = ({
	onClaim,
	isClaiming = false,
	wallets,
	amount,
	reward,
	processed = 0,
	active: isActive = false,
	buttonProps,
	tx
}) => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets[0]);
	const isComplete =
		reward.limit && reward.limit > 0 ? processed >= reward.limit : false;

	const closeDialog = useCallback(() => {
		if (!isClaiming) {
			setShowDialog(false);
		}
	}, [isClaiming]);

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
			backgroundColor="transparent"
			inputContainerProps={{
				background: "none",
				border: "none"
			}}
			{...(wallets.length > 1
				? {
						iconRight: () => (
							<ChevronDownIcon size={22} opacity={0.5} background="#ff" />
						),
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
				iconBefore={
					isActive ? () => <UilArrowCircleDown size="28" /> : LockIcon
				}
				onClick={isActive ? () => setShowDialog(true) : () => null}
				pointerEvents={isActive ? "auto" : "none"}
			>
				<Strong color="inherit" fontSize="1.1em">
					Claim Rewards
				</Strong>
			</Button>
			<Dialog
				isShown={showDialog}
				title={tx ? "🎉 Rewards sent" : "💸 Claim your Rewards"}
				onCloseComplete={closeDialog}
				hasFooter={false}
			>
				<Pane
					position="relative"
					paddingBottom={tx ? undefined : majorScale(7) + 20}
				>
					<Pane
						display="flex"
						alignItems="center"
						marginBottom={24}
						flexDirection="column"
					>
						<Heading is="h4" size={900}>
							{amount} {reward.ticker.toUpperCase()}
						</Heading>
						{tx ? (
							<Paragraph size={500}>has been paid to</Paragraph>
						) : (
							<Paragraph size={500}>will be paid to</Paragraph>
						)}
						<Pane
							border={`1px solid rgb(220, 220, 220)`}
							borderRadius={8}
							marginTop={12}
							width="100%"
							className={css`
								[role="button"] {
									width: 100%;
								}
								[role="button"] > div {
									border-radius: 8px;
								}
							`}
						>
							{wallets.length > 1 && !tx ? (
								<SelectMenu
									options={wallets
										// options={[
										// 	wallets[0],
										// 	wallets[0],
										// 	wallets[0],
										// 	wallets[0],
										// 	wallets[0]
										// ]
										// 	.map((w) => {
										// 		return {
										// 			...w,
										// 			address: `${w.address}_123`
										// 		};
										// 	})
										.filter((w) => w.address !== selectedWallet.address)
										.map((w) => ({
											label: truncate(w.address, 10, 6),
											value: w.address,
											icon: connectionImages[w.connection]?.src
										}))}
									selected={selectedWallet.address}
									hasFilter={false}
									hasTitle={false}
									onSelect={(item) =>
										setSelectedWallet(
											wallets.find((w) => w.address === item.value) ||
												wallets[0]
										)
									}
									width={300}
									statelessProps={{
										className: css`
											div {
												font-size: 14px;
											}

											img {
												height: 24px;
												width: 24px;
												padding: 0;
											}
										`
									}}
								>
									<Pane>{WalletCard}</Pane>
								</SelectMenu>
							) : (
								WalletCard
							)}
						</Pane>
						{tx && (
							<Pane marginTop={24} width="100%">
								<InputField
									iconSize={18}
									background="none"
									id="reward-tx-url"
									label="Receipt Transaction URL"
								>
									<Pane
										width="100%"
										display="flex"
										flexDirection="row"
										height={42}
										alignItems="center"
										paddingX={8}
										overflowX="auto"
									>
										<Anchor
											display="block"
											flex={1}
											paddingX={6}
											size={500}
											href={tx.url}
											external
										>
											{tx.url}
										</Anchor>
									</Pane>
								</InputField>
							</Pane>
						)}
					</Pane>
					{selectedWallet.chain === Chains.ARWEAVE && (
						<Pane
							display="flex"
							alignItems="center"
							flexDirection="row"
							marginBottom={16}
							paddingTop={16}
							borderTop
						>
							<Image
								src={chainImages[selectedWallet.chain]}
								width={70}
								height={70}
							/>
							<Paragraph size={500} marginY={0} marginLeft={16}>
								<Strong fontSize="inherit">Arweave</Strong> Blockchain rewards
								may take up to 20 minutes to process.
							</Paragraph>
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
								padding={10}
								backgroundColor={colors.gray100}
								borderRadius={8}
							>
								<UilWallet size="40" color={colors.gray800} />
							</Pane>
							<Pane marginLeft={16}>
								<Paragraph size={500} marginTop={0} marginBottom={8}>
									<Strong fontSize="inherit">
										Rewarding your Magic Wallet?
									</Strong>
								</Paragraph>
								<Paragraph size={500} marginY={0}>
									Click the <Strong fontSize="inherit">Wallet Icon</Strong> in
									the Menu to send your funds to an Exchange or to another
									wallet.
								</Paragraph>
							</Pane>
						</Pane>
					)}
					{!tx && (
						<Button
							height={majorScale(7)}
							appearance={amount > 0 ? "primary" : "none"}
							onClick={() => onClaim(selectedWallet)}
							minWidth={250}
							position="fixed"
							left={10}
							right={10}
							bottom={10}
							isLoading={isClaiming}
						>
							{amount > 0 ? (
								<Strong color="#fff" fontSize="1.1em">
									👉&nbsp;&nbsp;Claim Rewards
								</Strong>
							) : (
								<Strong fontSize="1.1em">You need to earn more rewards</Strong>
							)}
						</Button>
					)}
				</Pane>
			</Dialog>
		</>
	);
};

export default ClaimButton;
