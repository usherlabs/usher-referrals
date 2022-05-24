/**
 * When viewing Compaigns where there are no partnerships, affiliate may want to choose a preferred wallet to view and join campaigns with.
 */

import useLocalStorage from "use-local-storage";
import produce from "immer";

import { Chains } from "@/types";

function usePreferredWallet() {
	const [preferredWallets, setPreferredWalletsState] = useLocalStorage<
		Record<Chains, string>
	>("preferred-wallets", {
		[Chains.ARWEAVE]: ""
	});

	const setPreferredWallets = (chain: Chains, wallet: string) => {
		setPreferredWalletsState(
			produce(preferredWallets, (draft: Record<Chains, string>) => {
				draft[chain] = wallet;
			})
		);
	};

	return [preferredWallets, setPreferredWallets];
}

export default usePreferredWallet;
