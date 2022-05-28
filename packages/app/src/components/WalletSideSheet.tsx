import React, { useCallback, useEffect, useState } from "react";
import {
	Button,
	// Tooltip,
	Strong,
	toaster,
	useTheme,
	Label,
	Heading,
	SideSheet,
	Pane,
	majorScale,
	ArrowLeftIcon
} from "evergreen-ui";
import CopyToClipboard from "react-copy-to-clipboard";
// import startCase from "lodash/startCase";
import Image from "next/image";
import { useQuery } from "react-query";
import allSettled from "promise.allsettled";

import { Wallet, Chains, Connections } from "@/types";
import truncate from "@/utils/truncate";
import getArweaveClient from "@/utils/arweave-client";
import WalletConnect from "@/components/WalletConnect";
import { useArConnect } from "@/hooks";
import { connectionImages } from "@/utils/connections-map";

const arweave = getArweaveClient();

export type Props = {
	isShown: boolean;
	wallets: Wallet[];
	onClose: () => void;
};

const getBalances = (wallets: Wallet[]) => {
	return allSettled(
		wallets.map(async (wallet) => {
			const w = {
				...wallet,
				balance: "0 AR"
			};
			if (wallet.chain === Chains.ARWEAVE) {
				const winston = await arweave.wallets.getBalance(wallet.address);
				const ar = arweave.ar.winstonToAr(winston);
				w.balance = `${parseFloat(ar).toFixed(4)} AR`;
			} else {
				// TODO: In the future, support balance fetching for wallets beyond Arweave
			}
			return w;
		})
	);
};

const WalletSideSheet: React.FC<Props> = ({ isShown, wallets, onClose }) => {
	const { colors } = useTheme();
	const [showWalletConnect, setShowWalletConnect] = useState(false);
	const balances = useQuery(["balances", wallets], () => getBalances(wallets), {
		staleTime: 10000
	});
	const [getArConnect] = useArConnect();
	const [hiddenConnections, setHiddenConnections] = useState<Connections[]>([]);

	useEffect(() => {
		(async () => {
			const arconnect = getArConnect();
			if (arconnect) {
				try {
					const address = await arconnect.getActiveAddress();
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
			if (
				wallets
					.map((wallet) => wallet.connection)
					.includes(Connections.MAGIC) &&
				!hiddenConnections.includes(Connections.MAGIC)
			) {
				setHiddenConnections([...hiddenConnections, Connections.MAGIC]);
			}
		})();
	}, [wallets, hiddenConnections]);

	const onCopy = useCallback(() => {
		toaster.notify("Address copied");
	}, []);

	const onWalletConnect = useCallback(() => {
		if (showWalletConnect) {
			setShowWalletConnect(false);
			return;
		}
		setShowWalletConnect(true);
	}, [showWalletConnect]);

	return (
		<SideSheet isShown={isShown} onCloseComplete={onClose}>
			{showWalletConnect ? (
				<Pane>
					<Pane padding={10}>
						<Button
							appearance="minimal"
							iconBefore={ArrowLeftIcon}
							onClick={onWalletConnect}
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
			) : (
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
						{Object.values(Chains).map((chain) => {
							const walletsForChain = wallets.filter(
								(wallet) => wallet.chain === chain
							);

							if (walletsForChain.length === 0) {
								return null;
							}

							return (
								<Pane marginBottom={16} key={chain}>
									<Label
										display="block"
										marginBottom={4}
										size={300}
										fontWeight={900}
									>
										{chain.toUpperCase()}
									</Label>
									<Pane border={`1px solid ${colors.gray400}`} borderRadius={8}>
										{walletsForChain.map((wallet, i) => {
											let balance = `...`;
											if (!balances.isLoading && balances.data) {
												const found = balances.data.find(
													// @ts-ignore
													(bal) => bal.value.address === wallet.address
												);
												if (found) {
													// @ts-ignore
													balance = found.value.balance;
												}
											}

											return (
												<Pane
													key={wallet.address}
													display="flex"
													alignContent="center"
													flexDirection="row"
													justifyContent="space-between"
													padding={16}
													borderBottom={
														i === walletsForChain.length - 1
															? ""
															: `1px solid ${colors.gray400}`
													}
												>
													<Pane
														display="flex"
														alignItems="center"
														justifyContent="center"
														flexDirection="row"
													>
														<Pane
															marginRight={8}
															display="flex"
															alignItems="center"
															justifyContent="center"
														>
															{/* <Tooltip content={startCase(wallet.connection)}> */}
															<Image
																src={connectionImages[wallet.connection]}
																width={20}
																height={20}
															/>
															{/* </Tooltip> */}
														</Pane>
														<Pane>
															{/* <Tooltip content="copy"> */}
															<CopyToClipboard
																text={wallet.address}
																onCopy={onCopy}
															>
																<Label color={colors.gray800}>
																	{truncate(wallet.address, 6, 4)}
																</Label>
															</CopyToClipboard>
															{/* </Tooltip> */}
														</Pane>
													</Pane>
													<Pane>
														<Strong>{balance}</Strong>
													</Pane>
												</Pane>
											);
										})}
									</Pane>
								</Pane>
							);
						})}
					</Pane>
					{[...hiddenConnections].sort().join(",") !==
						[...Object.values(Connections)].sort().join(",") && (
						<Pane
							paddingTop={40}
							paddingX={40}
							paddingBottom={20}
							display="flex"
							width="100%"
							alignItems="center"
							justifyContent="center"
						>
							<Button
								height={majorScale(5)}
								minWidth={260}
								onClick={onWalletConnect}
							>
								<Strong>Connect a Wallet</Strong>
							</Button>
						</Pane>
					)}
				</Pane>
			)}
		</SideSheet>
	);
};

export default WalletSideSheet;
