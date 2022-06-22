/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single authentication (wallet connection)
 */
import { WalletModel } from "@usher/ceramic";
import { Sha256 } from "@aws-crypto/sha256-js";

import { Wallet } from "@/types";
import Auth from "./auth";

type MagicWallet = {
	arweave?: {
		address: string;
		data: string;
		created_at: number;
	};
};

const CERAMIC_MAGIC_WALLETS_KEY = "magicWallets";
const CERAMIC_SHAREABLE_OWNER_KEY = "shareableOwner";

class WalletAuth extends Auth {
	constructor(
		protected _wallet: Wallet,
		protected sign: (key: string) => Promise<string>
	) {
		super(WalletModel);
	}

	public get wallet() {
		return this._wallet;
	}

	public get address() {
		return this._wallet.address;
	}

	public async connect() {
		const wallet = this._wallet;
		const id = [wallet.chain, wallet.address].join(":");
		const sig = await this.sign(id);

		//* We have to SHA256 hash here because the Seed is required to be 32 bytes
		const hash = new Sha256();
		hash.update(sig);
		const entropy = await hash.digest();

		await this.authenticate(id, entropy);
	}

	/**
	 * Fetch the ShareableOwner ID
	 */
	public async getShareableOwnerId(): Promise<string | null> {
		const content = await this.store.get(CERAMIC_SHAREABLE_OWNER_KEY);
		if (content) {
			return content.id;
		}
		return null;
	}

	/**
	 * Set the ShareableOwner ID
	 */
	public async setShareableOwnerId(id: string): Promise<void> {
		await this.store.set(CERAMIC_SHAREABLE_OWNER_KEY, { id }, { pin: true });
	}

	public getMagicWallets() {
		return this.store.get(CERAMIC_MAGIC_WALLETS_KEY);
	}

	public addMagicWallet(wallet: MagicWallet) {
		return this.store.merge(CERAMIC_MAGIC_WALLETS_KEY, wallet);
	}
}

export default WalletAuth;
