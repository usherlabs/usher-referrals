import { Chains, Wallet } from "@usher.so/shared";
import allSettled from "promise.allsettled/implementation";
import { ethers } from "ethers";
import { getArweaveClient } from "@/utils/arweave-client";
import { getEthereumClient } from "@/utils/ethereum-client";

type WalletWithBalance = Wallet & {
	balance: string;
};

export const getBalances = async (wallets: Wallet[]) => {
	const arweave = getArweaveClient();
	const ethereum = getEthereumClient();

	const results = await allSettled<WalletWithBalance>(
		wallets.map(async (wallet) => {
			const w = {
				...wallet,
				balance: ""
			};
			if (wallet.chain === Chains.ARWEAVE) {
				const winston = await arweave.wallets.getBalance(wallet.address);
				const ar = arweave.ar.winstonToAr(winston);
				w.balance = `${parseFloat(ar).toFixed(4)} AR`;
			} else if (wallet.chain === Chains.ETHEREUM) {
				const wei = await ethereum.getBalance(wallet.address);
				const eth = ethers.utils.formatEther(wei);
				w.balance = `${parseFloat(eth).toFixed(4)} ETH`;
			} else {
				// TODO: In the future, support balance fetching for wallets beyond Arweave
			}
			return w;
		})
	);

	const resp: WalletWithBalance[] = [];
	results.forEach((res) => {
		if (res.status === "fulfilled" && !!res.value) {
			resp.push(res.value);
		}
	});
	return resp;
};
