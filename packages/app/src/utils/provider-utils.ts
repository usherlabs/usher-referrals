import { ProviderLabel } from "@/utils/onboard";
import { Connections } from "@usher.so/shared";

export const providerLabelByConnection = {
	[Connections.ARCONNECT]: ProviderLabel.ArConnect,
	[Connections.COINBASEWALLET]: ProviderLabel.CoinbaseWallet,
	[Connections.MAGIC]: ProviderLabel.Magic,
	[Connections.METAMASK]: ProviderLabel.MetaMask,
	[Connections.WALLETCONNECT]: ProviderLabel.WalletConnect
} as const;

export const connectionByProviderLabel = {
	[ProviderLabel.ArConnect]: Connections.ARCONNECT,
	[ProviderLabel.CoinbaseWallet]: Connections.COINBASEWALLET,
	[ProviderLabel.Magic]: Connections.MAGIC,
	[ProviderLabel.MetaMask]: Connections.METAMASK,
	[ProviderLabel.WalletConnect]: Connections.WALLETCONNECT
} as const;

export const EVMConnectionsList = [
	Connections.COINBASEWALLET,
	Connections.METAMASK,
	Connections.WALLETCONNECT
] as const;

export type EVMConnections = typeof EVMConnectionsList[number];
