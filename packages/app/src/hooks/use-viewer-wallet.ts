/**
 * When viewing Compaigns where there are no partnerships, affiliate may want to choose a preferred wallet to view and join campaigns with.
 */

import useLocalStorage from "use-local-storage";
import produce from "immer";

import { Wallet, Chains } from "@/types";
import useUser from "./use-user";

type State = Record<Chains, string>;

function userViewerWallet(
	chain: Chains
): [Wallet | undefined, (wallet: string) => void] {
	const {
		user: { wallets }
	} = useUser();
	const [preferredWallets, setPreferredWalletsState] = useLocalStorage<State>(
		"preferred-wallets",
		{
			[Chains.ARWEAVE]: "",
			[Chains.ETHEREUM]: ""
		}
	);

	const setPreferredWallet = (wallet: string) => {
		setPreferredWalletsState(
			produce(preferredWallets, (draft: State) => {
				draft[chain] = wallet;
			})
		);
	};

	const viewerWallet =
		wallets.find((wallet) => wallet.address === preferredWallets[chain]) ||
		wallets.find((wallet) => wallet.chain === chain);

	return [viewerWallet, setPreferredWallet];
}

export default userViewerWallet;
