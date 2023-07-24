import React, { useCallback, useEffect, useState } from "react";
import {
	ArrowLeftIcon,
	Button,
	Heading,
	Label,
	majorScale,
	Pane,
	SendMessageIcon,
	Strong,
	Text,
	TextInput
} from "evergreen-ui";
import { css } from "@linaria/core";
import isNumber from "is-number";
import { Connections } from "@usher.so/shared";
import truncate from "@/utils/truncate";
import WalletConnect from "@/components/connect/WalletConnect";
import InputField from "@/components/InputField";
import { useArConnect, useUser } from "@/hooks";
import { useCustomTheme } from "@/brand/themes/theme";
import { WalletsForConnection } from "@/components/wallets-manager/WalletsForConnection";
import { useSendFunds } from "@/components/wallets-manager/use-send-funds";
import { useAtomValue } from "jotai";
import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";
import { UnsignedWalletsForConnection } from "@/components/wallets-manager/UnsignedWalletsForConnection";

export type Props = {
	onClose: () => void;
};

const WalletsManager: React.FC<Props> = ({ onClose }) => {
	const {
		user: { wallets }
	} = useUser();
	const { colors } = useCustomTheme();
	const [showWalletConnect, setShowWalletConnect] = useState(false);
	const [arConnect] = useArConnect();
	const [hiddenConnections, setHiddenConnections] = useState<Connections[]>([]);
	const {
		onShowSendFunds,
		setShowSendFunds,
		showSendFunds,
		sendFunds,
		sendFundsLoading,
		sendingFunds
	} = useSendFunds();

	const unsignedWallets = useAtomValue(onboardAtoms.connectedUnsignedAccounts);

	useEffect(() => {
		(async () => {
			if (arConnect) {
				try {
					const address = await arConnect.getActiveAddress();
					if (
						wallets.map((wallet) => wallet.address).includes(address) &&
						!hiddenConnections.includes(Connections.ARCONNECT)
					) {
						setHiddenConnections([...hiddenConnections, Connections.ARCONNECT]);
					}
				} catch (e) {
					// ...
				}
			}
			const activeConnections = wallets.map((wallet) => wallet.connection);
			for (const connection of Object.values(Connections)) {
				if (
					activeConnections.includes(connection) &&
					!hiddenConnections.includes(connection)
				) {
					setHiddenConnections([...hiddenConnections, connection]);
				}
			}
		})();
	}, [wallets, hiddenConnections, arConnect]);

	const onWalletConnectToggle = useCallback(() => {
		if (showWalletConnect) {
			setShowWalletConnect(false);
			return;
		}
		setShowWalletConnect(true);
	}, [showWalletConnect]);

	if (showWalletConnect) {
		return (
			<Pane>
				<Pane padding={10}>
					<Button
						appearance="minimal"
						iconBefore={ArrowLeftIcon}
						onClick={onWalletConnectToggle}
						height={majorScale(5)}
					>
						<Label pointerEvents="none">Back to Wallet</Label>
					</Button>
				</Pane>
				<Pane
					marginBottom={24}
					paddingTop={10}
					paddingX={40}
					paddingBottom={20}
					borderBottomWidth="1px"
					borderBottomColor={colors.gray400}
					borderBottomStyle="solid"
				>
					<Heading size={700}>Connect a Wallet</Heading>
				</Pane>
				<Pane
					marginBottom={16}
					paddingX={40}
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<WalletConnect hide={hiddenConnections} onConnect={onClose} />
				</Pane>
			</Pane>
		);
	}

	if (showSendFunds) {
		return (
			<Pane>
				<Pane padding={10}>
					<Button
						appearance="minimal"
						iconBefore={ArrowLeftIcon}
						onClick={() => setShowSendFunds(null)}
						height={majorScale(5)}
					>
						<Label pointerEvents="none">Back to Wallet</Label>
					</Button>
				</Pane>
				<Pane
					marginBottom={24}
					paddingTop={10}
					paddingX={40}
					paddingBottom={20}
					borderBottomWidth="1px"
					borderBottomColor={colors.gray400}
					borderBottomStyle="solid"
				>
					<Heading size={700}>
						Send funds from {truncate(showSendFunds.wallet.address, 6, 4)}
					</Heading>
				</Pane>
				<Pane marginBottom={16} paddingX={40}>
					<InputField
						id="send-funds"
						label="Enter the amount to send"
						background="none"
						isLoading={sendFundsLoading}
					>
						<Pane
							width="100%"
							display="flex"
							flexDirection="row"
							height={42}
							alignItems="center"
							paddingX={8}
						>
							<TextInput
								display="block"
								flex={1}
								paddingX={6}
								onChange={(e: any) => {
									if (isNumber(e.target.value)) {
										setShowSendFunds({
											...showSendFunds,
											amount: e.target.value
										});
									} else if (!e.target.value) {
										setShowSendFunds({
											...showSendFunds,
											amount: 0
										});
									}
								}}
								borderWidth={0}
								marginRight={12}
								value={showSendFunds.amount}
								fontSize="1em"
							/>
							<Text
								textDecoration="underline"
								size={300}
								fontWeight={700}
								display="block"
								paddingX={6}
								onClick={() => onShowSendFunds(showSendFunds.wallet)}
								cursor="pointer"
								className={css`
									:active {
										opacity: 0.8;
									}
								`}
							>
								MAX
							</Text>
						</Pane>
					</InputField>
					<Pane display="flex" justifyContent="flex-end" width="100%">
						<Button
							onClick={sendFunds}
							isLoading={sendingFunds}
							appearance="primary"
							iconBefore={SendMessageIcon}
							height={majorScale(5)}
							marginTop={12}
							minWidth={200}
						>
							<Strong color="#fff">Send Funds</Strong>
						</Button>
					</Pane>
				</Pane>
			</Pane>
		);
	}

	return (
		<Pane>
			<Pane
				marginBottom={24}
				paddingTop={40}
				paddingX={40}
				paddingBottom={20}
				borderBottomWidth="1px"
				borderBottomColor={colors.gray400}
				borderBottomStyle="solid"
			>
				<Heading size={700}>My Wallet</Heading>
			</Pane>
			<Pane marginBottom={16} paddingX={40}>
				{Object.values(Connections).map((connection) => {
					const walletsForConnection = wallets.filter(
						(wallet) => wallet.connection === connection
					);

					const unsignedWalletsForConnection = unsignedWallets.filter(
						(wallet) => wallet.connection === connection
					);

					if (walletsForConnection.length === 0) {
						return null;
					}

					return (
						<>
							<WalletsForConnection
								connection={connection}
								wallets={walletsForConnection}
							></WalletsForConnection>
							<UnsignedWalletsForConnection
								wallets={unsignedWalletsForConnection}
							/>
						</>
					);
				})}
			</Pane>
			{/* TODO Support multi wallet */}
			{/* {[...hiddenConnections].sort().join(",") !== */}
			{/*	[...Object.values(Connections)].sort().join(",") && */}
			{/*	!isUserLoading && ( */}
			{/*		<Pane */}
			{/*			paddingTop={40} */}
			{/*			paddingX={40} */}
			{/*			paddingBottom={20} */}
			{/*			display="flex" */}
			{/*			width="100%" */}
			{/*			alignItems="center" */}
			{/*			justifyContent="center" */}
			{/*		> */}
			{/*			<Button */}
			{/*				height={majorScale(5)} */}
			{/*				minWidth={260} */}
			{/*				onClick={onWalletConnectToggle} */}
			{/*			> */}
			{/*				<Strong>Connect a Wallet</Strong> */}
			{/*			</Button> */}
			{/*		</Pane> */}
			{/*	)} */}
		</Pane>
	);
};

export default WalletsManager;
