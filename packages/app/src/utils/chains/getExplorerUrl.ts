import { Chains } from "@usher.so/shared";
import {
	ARWEAVE_EXPLORER_TX_URL,
	ETHEREUM_EXPLORER_TX_URL,
	POLYGON_EXPLORER_TX_URL
} from "@/constants";

export const getExplorerUrl = ({
	chain,
	txId
}: {
	chain: Chains;
	txId: string;
}) => {
	switch (chain) {
		case Chains.ETHEREUM:
			return `${ETHEREUM_EXPLORER_TX_URL}${txId}`;
		case Chains.BSC:
			return `https://bscscan.com/tx/${txId}`;
		case Chains.ARWEAVE:
			return `${ARWEAVE_EXPLORER_TX_URL}${txId}`;
		case Chains.POLYGON:
			return `${POLYGON_EXPLORER_TX_URL}${txId}`;
		default:
			throw new Error("Invalid chain");
	}
};
