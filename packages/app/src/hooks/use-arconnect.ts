/**
 * See https://github.com/martonlederer/use-arconnect/blob/master/src/index.ts
 */
import { useEffect, useState, useCallback } from "react";

const useArConnect = () => {
	const [isLoading, setLoading] = useState(true);
	const getWallet = useCallback(() => {
		if (!isLoading) {
			return window.arweaveWallet;
		}
		return null;
	}, [isLoading]);

	useEffect(() => {
		if (window.arweaveWallet) {
			setLoading(false);
		} else {
			window.addEventListener("arweaveWalletLoaded", () => {
				setLoading(false);
			});
		}
	}, []);

	return [getWallet, isLoading];
};

export default useArConnect;
