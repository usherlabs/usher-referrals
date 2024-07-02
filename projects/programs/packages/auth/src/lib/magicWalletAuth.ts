import { WalletAuth } from "./walletAuth.js";

type MagicWallet = {
	arweave?: {
		address: string;
		data: string;
	};
};

const CERAMIC_MAGIC_WALLETS_KEY = "magicWallets";

/**
 * A class representing a single authentication (wallet connection)
 */
export class MagicWalletAuth {
	constructor(private auth: WalletAuth) {}

	public getMagicWallets() {
		return this.auth.store.get(CERAMIC_MAGIC_WALLETS_KEY);
	}

	public addMagicWallet(wallet: MagicWallet) {
		return this.auth.store.merge(CERAMIC_MAGIC_WALLETS_KEY, wallet);
	}
}
