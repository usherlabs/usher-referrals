let arweaveWallet: typeof window.arweaveWallet | null | undefined;

export default () => {
	return new Promise<typeof window.arweaveWallet | null>((resolve) => {
		if (arweaveWallet !== undefined) {
			resolve(arweaveWallet);
		} else if (window.arweaveWallet !== undefined) {
			resolve(window.arweaveWallet);
		} else {
			const interval = setInterval(() => {
				if (window.arweaveWallet) {
					clearInterval(interval);
					arweaveWallet = window.arweaveWallet;
					resolve(arweaveWallet);
				}
			}, 500);
			setTimeout(() => {
				if (!window.arweaveWallet) {
					clearInterval(interval);
					arweaveWallet = null;
					resolve(null);
				}
			}, 2000);
		}
	});
};
