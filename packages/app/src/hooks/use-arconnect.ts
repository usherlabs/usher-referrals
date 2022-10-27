import { useCallback, useEffect, useState } from "react";
import getArConnect from "@/utils/arconnect";

const useArConnect = (): [
	() => typeof window.arweaveWallet | null,
	boolean
] => {
	const [isLoading, setLoading] = useState(true);
	const [arConnect, setArConnect] = useState<
		typeof window.arweaveWallet | null
	>(null);

	const callback = useCallback(() => {
		return arConnect;
	}, [arConnect]);

	useEffect(() => {
		getArConnect().then((result) => {
			setArConnect(() => result);
			setLoading(false);
		});
	}, []);

	return [callback, isLoading];
};

export default useArConnect;
