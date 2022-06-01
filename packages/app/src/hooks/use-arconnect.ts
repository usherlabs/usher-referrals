/**
 * See https://github.com/martonlederer/use-arconnect/blob/master/src/index.ts
 */
import { useEffect, useState } from "react";
import getArConnect from "@/utils/arconnect";

const useArConnect = (): [typeof getArConnect, boolean] => {
	const [isLoading, setLoading] = useState(true);

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
			const timeout = setTimeout(() => {
				clearInterval(interval);
				setLoading(false); // ArConnect not loaded...
			}, 2000);

			return () => {
				clearTimeout(timeout);
				clearInterval(interval);
			};
		}
		return () => {};
	}, []);

	return [getArConnect, isLoading];
};

export default useArConnect;
