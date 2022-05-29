/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single authentication (wallet connection)
 */
import { DID } from "dids";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdProvider } from "@3id/did-provider";

import { ceramicUrl } from "@/env-config";
import {
	Wallet,
	Partnership,
	CampaignReference,
	Chains,
	Connections
} from "@/types";

class Auth {
	private _did!: DID;

	private _wallet!: Wallet;

	private _partnershipsId: string = ""; // Partnerships Stream ID

	private _partnerships: Partnership[] = [];

	private _ceramic;

	// constructor(did: DID, wallet: Wallet) {
	// 	this._did = did;
	// 	this._wallet = wallet;
	// 	this._ceramic = new CeramicClient(ceramicUrl); // new instance of ceramic client for each DID
	// }

	constructor() {
		this._ceramic = new CeramicClient(ceramicUrl); // new instance of ceramic client for each DID
	}

	public get did() {
		return this._did;
	}

	public get wallet() {
		return this._wallet;
	}

	public get partnerships() {
		return this._partnerships;
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

		this._wallet = {
			address,
			chain,
			connection
		};

		// Load the Partnerships Stream
	}

	// Add Campaign to Partnerships Stream and load new index
	public async addPartnership(campaign: CampaignReference) {
		// ...
	}
}

export default Auth;
