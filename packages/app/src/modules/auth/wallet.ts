/* eslint-disable no-underscore-dangle */

import { TileDocument } from "@ceramicnetwork/stream-tile";
import * as datamodels from "@usher.so/datamodels";

import { Wallet, CampaignReference } from "@/types";
import Auth from "./auth";

const { WalletAliases, WalletModel } = datamodels;

type MagicWallet = {
	arweave?: {
		address: string;
		data: string;
	};
};

type SetObject = {
	set: string[];
};

const CERAMIC_MAGIC_WALLETS_KEY = "magicWallets";
const CERAMIC_PARTNERSHIPS_KEY = "partnerships";

console.log(
	"outside constructor: ",
	{ WalletModel, WalletAliases },
	datamodels
);

/**
 * A class representing a single authentication (wallet connection)
 */
class WalletAuth extends Auth {
	constructor(protected _wallet: Wallet) {
		console.log({ WalletModel, WalletAliases });
		super(WalletAliases);
	}

	public get wallet() {
		return this._wallet;
	}

	public get address() {
		return this._wallet.address;
	}

	public get id() {
		const wallet = this._wallet;
		const id = [wallet.chain, wallet.address].join(":");
		return id;
	}

	public async connect(sig: Uint8Array) {
		await this.authenticate(this.id, sig);
	}

	public getMagicWallets() {
		return this.store.get(CERAMIC_MAGIC_WALLETS_KEY);
	}

	public addMagicWallet(wallet: MagicWallet) {
		return this.store.merge(CERAMIC_MAGIC_WALLETS_KEY, wallet);
	}

	/**
	 * Load Ceramic related data for the given authentication
	 */
	public async load() {
		await this.loadPartnerships();
	}

	public async loadPartnerships() {
		try {
			const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
			if (setObj) {
				const { set } = setObj as SetObject;
				return set;
			}
		} catch (e) {
			// partnerships record may not exist.
		}

		return [];
	}

	public async addPartnership(campaignReference: CampaignReference) {
		const doc = await TileDocument.create(
			// @ts-ignore
			this._ceramic,
			campaignReference,
			{
				schema: this.model.getSchemaURL("partnership"),
				family: "usher:partnerships"
			},
			{
				pin: true
			}
		);

		console.log(`Partership created with stream id`, doc.id.toString());

		let set: string[] = [];
		const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (setObj) {
			set = (setObj as SetObject).set;
		}

		set.push(doc.id.toString());

		await this.store.set(CERAMIC_PARTNERSHIPS_KEY, { set });

		console.log(`Partership added to DID set`, { set });

		// ? In the future we should index the partnerships here too.

		return {
			id: doc.id.toString(),
			campaign: campaignReference
		};
	}
}

export default WalletAuth;
