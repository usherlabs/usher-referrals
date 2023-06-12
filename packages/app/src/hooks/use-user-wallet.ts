import useUser from "./use-user";

export const useUserWallet = () => {
	const {
		user: { wallets },
		isLoading: isWalletLoading
	} = useUser();
	const walletCount = wallets.length;

	return { wallets, isWalletLoading, walletCount };
};
