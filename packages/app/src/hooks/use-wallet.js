import isEmpty from "lodash/isEmpty";
import { useEffect, useContext } from "react";

import { UserContext } from "@/providers/User";
import { WalletContext } from "@/providers/Wallet";
import handleException from "@/utils/handle-exception";
import saveWallet from "@/actions/wallet";
import saveInviteLink from "@/actions/invite-link";
import joinDiscordGuild from "@/actions/join-discord";
import useQueue from "./use-queue";

function useWallet() {
	const {
		wallet,
		loading,
		isArConnectLoaded,
		removeWallet,
		getWallet,
		setWallet
	} = useContext(WalletContext);
	const { user } = useContext(UserContext);
	const { address } = wallet;
	const Queue = useQueue();

	useEffect(() => {
		if (!isEmpty(address) && !isEmpty(user)) {
			// This queue ensure that if the function is called many times, it processes the following in sequence.
			// TODO: This is still running more than once...
			Queue.addJob({
				task() {
					(async () => {
						try {
							const { id: walletId } = await saveWallet(user, address);
							const [{ id: linkId }, hits = 0] = await saveInviteLink(walletId);
							setWallet({
								...wallet,
								id: walletId,
								link: { id: linkId, hits }
							}); // set ids to state
							if (user?.app_metadata?.provider === "discord") {
								await joinDiscordGuild(); // Join Discord Guild if new Wallet.
							}
						} catch (e) {
							handleException(e);
						}
					})();
				}
			});
		}
	}, [address, user]);

	useEffect(() => {
		// If user already fetched -- ie fetched from SSR
		if (!loading && !isEmpty(wallet)) {
			return () => {};
		}

		// Check first if ArConnect has loaded.
		if (isArConnectLoaded) {
			// Check if wallet exists if it does not already exist
			getWallet();
		}

		return () => {};
	}, [isArConnectLoaded]);

	return [
		wallet,
		loading,
		isArConnectLoaded,
		{
			removeWallet,
			getWallet,
			setWallet
		}
	];
}

export default useWallet;
