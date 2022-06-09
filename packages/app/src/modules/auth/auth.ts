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

	public async authenticate(id: string, secret: Uint8Array) {
		// Connect/Auth DID
		const threeIDAuth = await ThreeIdProvider.create({
			ceramic: this._ceramic,
			authId: id,
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
}

export default Auth;
