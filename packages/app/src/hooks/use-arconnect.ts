import getArConnect from "@/utils/arconnect";
import { useEffect, useState } from "react";

const useArConnect = (): [typeof window.arweaveWallet | null, boolean] => {
	const [isLoading, setLoading] = useState(true);
	const [arConnect, setArConnect] = useState<
		typeof window.arweaveWallet | null
	>(null);

	useEffect(() => {
		getArConnect().then((result) => {
			setArConnect(result);
			setLoading(false);
		});
	}, []);

	return [arConnect, isLoading];
};

export default useArConnect;
