/* eslint-disable no-underscore-dangle */

/**
 * A class representing a single Shareable Owner authentication
 */
import { ShareableOwnerModel } from "@usher/ceramic";

import Auth from "./auth";

class OwnerAuth extends Auth {
	constructor() {
		super(ShareableOwnerModel);
	}

	public connect(id: string, secret: Uint8Array) {
		return this.authenticate(id, secret);
	}

	/**
	 * Create a new Owner
	 *
	 * @return  {[type]}  [return description]
	 */
	public static async create(): Promise<OwnerAuth> {
		// ...
	}
}

export default OwnerAuth;
