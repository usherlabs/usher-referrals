import { Connections, Chains } from "@/types";
import ArConnectIcon from "@/assets/icon/arconnect.svg";
import MagicLinkIcon from "@/assets/icon/magic-icon.png";
import ArweaveIcon from "@/assets/icon/arweave-icon.png";

export const connectionImages = {
	[Connections.ARCONNECT]: ArConnectIcon,
	[Connections.MAGIC]: MagicLinkIcon
};

export const chainImages = {
	[Chains.ARWEAVE]: ArweaveIcon,
	[Chains.ETHEREUM]: ""
};
