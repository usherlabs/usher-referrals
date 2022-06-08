/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single authentication (wallet connection)
 */
import { DID } from "dids";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdProvider } from "@3id/did-provider";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { ceramicUtils } from "@/utils/ceramic-client";
import { WalletModel } from "@usher/ceramic";

import { ceramicUrl } from "@/env-config";
import {
	Wallet,
	Partnership,
	Chains,
	Connections,
	IDIDDataStore,
	IDataModel
} from "@/types";

type MagicWallet = {
	arweave?: {
		address: string;
		data: string;
		created_at: number;
	};
};

const CERAMIC_MAGIC_WALLETS_KEY = "magicWallets";

class Auth {
	private _did!: DID;

	private _wallet!: Wallet;

	private _ceramic;

	private model: IDataModel;

	private store: IDIDDataStore;

	constructor() {
		this._ceramic = new CeramicClient(ceramicUrl); // new instance of ceramic client for each DID;
		const model = new DataModel({
			ceramic: this._ceramic,
			aliases: WalletModel
		});
		const store = new DIDDataStore({ ceramic: this._ceramic, model });
		this.model = model;
		this.store = store;
	}

	public get did() {
		return this._did;
	}

	public get wallet() {
		return this._wallet;
	}

	public get address() {
		return this._wallet.address;
	}

	public get ceramic() {
		return this._ceramic;
	}

	public async connect(
		address: string,
		secret: Uint8Array,
		chain: Chains,
		connection: Connections
	) {
		// Connect/Auth DID
		const threeIDAuth = await ThreeIdProvider.create({
			ceramic: this._ceramic,
			authId: address,
			authSecret: secret,
			getPermission: (request: any) => Promise.resolve(request.payload.paths)
		});

		const did = new DID({
			// Get the DID provider from the 3ID Connect instance
			provider: threeIDAuth.getDidProvider(),
			resolver: {
				...get3IDResolver(this._ceramic),
				...getKeyResolver()
			}
		});
		// Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
		// authentication flow using 3ID Connect and the Ethereum provider
		await did.authenticate();

		this._ceramic.did = did;

		this._did = did;

		// Load the Partnerships Stream
		const pDefId = this.store.getDefinitionID(CERAMIC_PARTNERSHIP_KEY);
		const partnershipsData: { set: CampaignReference[] } | null =
			await this.store.get(CERAMIC_PARTNERSHIP_KEY);
		const recordId = await this.store.getRecordID(pDefId);
		let partnerships: Partnership[] = [];
		if (recordId) {
			const setId = ceramicUtils.urlToId(recordId);
			partnerships = ((partnershipsData || {}).set || []).map(
				(ref: CampaignReference, i: number) => {
					return {
						id: [setId, i].join("/"),
						campaign: {
							address: ref.address,
							chain: ref.chain
						}
					};
				}
			) as Partnership[];

			this._partnerships = partnerships;
		}

		this._wallet = {
			address,
			chain,
			connection,
			partnerships
		};
	}

	public getMagicWallets() {
		return this.store.get(CERAMIC_MAGIC_WALLETS_KEY);
	}

	public addMagicWallet(wallet: MagicWallet) {
		return this.store.merge(CERAMIC_MAGIC_WALLETS_KEY, wallet);
	}
}

export default Auth;
