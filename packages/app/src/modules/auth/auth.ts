/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single authentication (wallet connection)
 */
import { DID } from "dids";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { Sha256 } from "@aws-crypto/sha256-js";
import * as uint8arrays from "uint8arrays";

import { ceramicUrl } from "@/env-config";
import { IDIDDataStore, IDataModel } from "@/types";

interface IModelAliases {
	schemas: Record<string, string>;
	definitions: Record<string, string>;
	tiles: Record<string, string>;
}

abstract class Auth {
	protected _did!: DID;

	protected _ceramic;

	protected model: IDataModel;

	protected store: IDIDDataStore;

	constructor(aliases: IModelAliases) {
		this._ceramic = new CeramicClient(ceramicUrl); // new instance of ceramic client for each DID;
		const model = new DataModel({
			ceramic: this._ceramic,
			aliases
		});
		const store = new DIDDataStore({ ceramic: this._ceramic, model });
		this.model = model;
		this.store = store;
	}

	public get did() {
		return this._did;
	}

	public get ceramic() {
		return this._ceramic;
	}

	public async authenticate(id: string, key: Uint8Array) {
		const prefix = uint8arrays.fromString(`${id}|`);
		const p = new Uint8Array(prefix.length + key.length);
		p.set(prefix);
		p.set(key, prefix.length);

		console.log("connecting to wallet: ", uint8arrays.toString(p));

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
			resolver: getKeyResolver()
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
		const defId = this.store.getDefinitionID(key);
		const recordId = await this.store.getRecordID(defId);
		if (!recordId) {
			return "";
		}
		return recordId;
	}

	public async getIndex() {
		const index = await this.store.getIndex();
		if (!index) {
			return {};
		}
		return index;
	}

	public iterateIndex() {
		return this.store.iterator();
	}

	// Notice: this does not change the contents of the record itself, only the index.
	// https://developers.ceramic.network/reference/glaze/classes/did_datastore.DIDDataStore/#remove
	public removeRecord(key: string) {
		return this.store.remove(key);
	}
}

export default Auth;
