import ArConnectIcon from "@/assets/icon/arconnect.svg";
import ArweaveIcon from "@/assets/icon/arweave-icon.png";
import CoinbaseWalletIcon from "@/assets/icon/coinbasewallet.svg";
import EthereumIcon from "@/assets/icon/ethereum-icon.svg";
import MagicLinkIcon from "@/assets/icon/magic-icon.png";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import WalletConnectIcon from "@/assets/icon/walletconnect.svg";
import { Chains, Connections } from "@usher.so/shared";

export const connectionImages = {
	[Connections.ARCONNECT]: ArConnectIcon,
	[Connections.COINBASEWALLET]: CoinbaseWalletIcon,
	[Connections.MAGIC]: MagicLinkIcon,
	[Connections.METAMASK]: MetaMaskIcon,
	[Connections.WALLETCONNECT]: WalletConnectIcon
};

export const chainImages = {
	[Chains.ARWEAVE]: ArweaveIcon,
	[Chains.ETHEREUM]: EthereumIcon
};
