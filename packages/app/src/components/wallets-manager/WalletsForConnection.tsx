import pascalCase from "@/utils/pascal-case";
import { connectionImages } from "@/utils/images-map";
import { css } from "@linaria/core";
import truncate from "@/utils/truncate";
import {
	Button,
	Label,
	majorScale,
	Pane,
	Position,
	SendMessageIcon,
	Spinner,
	Strong,
	toaster,
	Tooltip
} from "evergreen-ui";
import { useQuery } from "react-query";
import { useCustomTheme } from "@/brand/themes/theme";
import { getBalances } from "@/components/wallets-manager/get-balances-for-wallets";
import { providerLabelByConnection } from "@/utils/provider-utils";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Chains, Connections, Wallet } from "@usher.so/shared";
import { useSendFunds } from "@/components/wallets-manager/use-send-funds";
import _ from "lodash";
import React from "react";
import Image from "next/image";
import { EVMChainLabelAndSwitcher } from "@/components/connect/EVMChainSwitch/EVMChainLabelAndSwitcher";

export const WalletsForConnection = ({
	wallets,
	connection
}: {
	wallets: Wallet[];
	connection: Connections;
}) => {
	const balances = useQuery(["balances", wallets], () => getBalances(wallets), {
		staleTime: 10000
	});

	const { colors } = useCustomTheme();

	const onCopy = React.useCallback(() => {
		toaster.notify("Address copied", {
			id: "wallet-side-sheet--address-copy"
		});
	}, []);

	const { onShowSendFunds } = useSendFunds();

	return (
		<Pane marginBottom={16}>
			<Label
				display="flex"
				marginBottom={4}
				justifyContent="space-between"
				alignItems={"center"}
				size={300}
				fontWeight={900}
			>
				<Pane display="flex" marginLeft={4}>
					<Pane marginRight={8}>
						<Tooltip content={pascalCase(connection)}>
							<Pane display="flex" alignItems="center" justifyContent="center">
								<Image
									src={connectionImages[connection]}
									width={20}
									height={20}
								/>
							</Pane>
						</Tooltip>
					</Pane>
					{providerLabelByConnection[connection]}
				</Pane>
				<EVMChainLabelAndSwitcher
					// @ts-ignore — probably upstream type bug
					position={Position.BOTTOM_RIGHT}
					providerLabel={providerLabelByConnection[connection]}
				/>
			</Label>
			<Pane border={`1px solid ${colors.gray400}`} borderRadius={8}>
				{wallets.map((wallet, i) => {
					let balance = "";
					if (
						!balances.isLoading &&
						balances.data &&
						!_.isEmpty(balances.data)
					) {
						const found = balances.data.find(
							(bal) => bal && bal.address === wallet.address
						);
						if (found) {
							balance = found.balance;
						}
					}

					return (
						<Pane
							key={wallet.address}
							borderBottom={
								i === wallets.length - 1 ? "" : `1px solid ${colors.gray400}`
							}
						>
							<Pane
								display="flex"
								alignContent="center"
								flexDirection="row"
								justifyContent="space-between"
								padding={16}
							>
								<Pane
									display="flex"
									alignItems="center"
									justifyContent="center"
									flexDirection="row"
								>
									<Pane>
										<Tooltip content="Copy Address">
											<Pane>
												<CopyToClipboard text={wallet.address} onCopy={onCopy}>
													<Label
														color={colors.gray800}
														className={css`
															cursor: pointer;

															&:active {
																opacity: 0.8;
															}
														`}
													>
														{truncate(wallet.address, 6, 4)}
													</Label>
												</CopyToClipboard>
											</Pane>
										</Tooltip>
									</Pane>
								</Pane>
								<Pane display="flex" flexDirection="row" alignItems="center">
									<Pane display="flex" alignItems="center">
										{!balances.isLoading ? (
											<Strong>{balance}</Strong>
										) : (
											<Spinner size={16} />
										)}
									</Pane>
								</Pane>
							</Pane>
							<Pane>
								{wallet.connection === Connections.MAGIC &&
									wallet.chain === Chains.ARWEAVE && (
										<Button
											iconBefore={SendMessageIcon}
											onClick={() => onShowSendFunds(wallet)}
											height={majorScale(3)}
											appearance="minimal"
											borderTop={`1px solid ${colors.gray300}`}
											width="100%"
										>
											Send Funds
										</Button>
									)}
							</Pane>
						</Pane>
					);
				})}
			</Pane>
		</Pane>
	);
};
