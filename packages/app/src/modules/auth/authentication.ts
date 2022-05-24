/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single authentication (wallet connection)
 */
import { DID } from "dids";

import { Wallet, Partnership, Campaign } from "@/types";

class Auth {
	private _did: DID;

	private _wallet: Wallet;

	private _partnershipsId: string = ""; // Partnerships Stream ID

	private _partnerships: Partnership[] = [];

	constructor(did: DID, wallet: Wallet) {
		this._did = did;
		this._wallet = wallet;
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

	// Load the Partnerships Stream
	public async load() {
		// ...
	}

	// Add Campaign to Partnerships Stream and load new index
	public async addPartnership(campaign: Campaign) {
		// ...
	}
}

export default Auth;
