/**
 * A class representing a single authentication (wallet connection)
 */
import awsSha256 from "@aws-crypto/sha256-js";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { ModelTypeAliases } from "@glazed/types";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver as getKeyResolver } from "key-did-resolver";
import * as uint8arrays from "uint8arrays";

import { AuthOptions } from "./options.js";

// ? Required for compatibility with CommonJS modules
const { Sha256 } = awsSha256;

type IDIDDataStore = DIDDataStore<
	ModelTypeAliases<
		Record<string, any>,
		Record<string, string>,
		Record<string, string>
	>,
	string
>;

type IDataModel = DataModel<
	ModelTypeAliases<
		Record<string, any>,
		Record<string, string>,
		Record<string, string>
	>,
	any
>;

interface IModelAliases {
	schemas: Record<string, string>;
	definitions: Record<string, string>;
	tiles: Record<string, string>;
}

export abstract class Auth {
	private readonly _options: AuthOptions;

	protected _did!: DID;

	protected _ceramic;

	protected model: IDataModel;

	protected _store: IDIDDataStore;

	constructor(aliases: IModelAliases, options?: Partial<AuthOptions>) {
		this._options = new AuthOptions(options);

		this._ceramic = new CeramicClient(this._options.ceramicUrl); // new instance of ceramic client for each DID;
		const model = new DataModel({
			ceramic: this._ceramic,
			aliases,
		});
		const store = new DIDDataStore({
			ceramic: this._ceramic,
			model,
		});
		this.model = model;
		this._store = store;
	}

	public get did() {
		return this._did;
	}

	public get ceramic() {
		return this._ceramic;
	}

	public get store() {
		return this._store;
	}

	public async authenticate(id: string, key: Uint8Array) {
		const prefix = uint8arrays.fromString(`${id}|`);
		const p = new Uint8Array(prefix.length + key.length);
		p.set(prefix);
		p.set(key, prefix.length);

		//* We have to SHA256 hash here because the Seed is required to be 32 bytes
		let entropy = p;
		if (entropy.byteLength !== 32) {
			const hash = new Sha256();
			hash.update(entropy);
			entropy = await hash.digest();
		}

		const did = new DID({
			// Get the DID provider from the 3ID Connect instance
			provider: new Ed25519Provider(entropy),
			resolver: getKeyResolver(),
		});
		// Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
		// authentication flow using 3ID Connect and the Ethereum provider
		await did.authenticate();

		this._ceramic.did = did;

		this._did = did;
	}

	public getSchema(key: string) {
		return this.model.getSchemaURL(key);
	}

	public async getRecordId(key: string) {
		const defId = this._store.getDefinitionID(key);
		const recordId = await this._store.getRecordID(defId);
		if (!recordId) {
			return "";
		}
		return recordId;
	}

	// Notice: this does not change the contents of the record itself, only the index.
	// https://developers.ceramic.network/reference/glaze/classes/did_datastore.DIDDataStore/#remove
	public removeRecord(key: string) {
		return this._store.remove(key);
	}
}
