import ArConnectIcon from "@/assets/icon/arconnect.svg";
import ArweaveIcon from "@/assets/icon/arweave-icon.png";
import EthereumIcon from "@/assets/icon/ethereum-icon.svg";
import MagicLinkIcon from "@/assets/icon/magic-icon.png";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import { Chains, Connections } from "@/types";

export const connectionImages = {
	[Connections.ARCONNECT]: ArConnectIcon,
	[Connections.MAGIC]: MagicLinkIcon,
	[Connections.METAMASK]: MetaMaskIcon
};

export const chainImages = {
	[Chains.ARWEAVE]: ArweaveIcon,
	[Chains.ETHEREUM]: EthereumIcon
};
