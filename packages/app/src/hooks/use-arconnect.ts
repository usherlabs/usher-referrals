/**
 * See https://github.com/martonlederer/use-arconnect/blob/master/src/index.ts
 */
import { useEffect, useState, useCallback } from "react";

const useArConnect = (): [
	() => typeof window.arweaveWallet | null,
	boolean
] => {
	const [isLoading, setLoading] = useState(true);
	const getProvider = useCallback(() => {
		return window.arweaveWallet;
	}, []);

	useEffect(() => {
		if (window.arweaveWallet) {
			setLoading(false);
		} else {
			window.addEventListener("arweaveWalletLoaded", () => {
				setLoading(false);
			});
			const interval = setInterval(() => {
				if (window.arweaveWallet) {
					clearInterval(interval);
					setLoading(false);
				}
			}, 500);
			setTimeout(() => {
				clearInterval(interval);
				setLoading(false); // ArConnect not loaded...
			}, 2000);
		}
	}, []);

	return [getProvider, isLoading];
};

export default useArConnect;
