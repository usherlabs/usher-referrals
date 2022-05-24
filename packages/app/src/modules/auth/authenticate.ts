import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdProvider } from "@3id/did-provider";
import * as uint8arrays from "uint8arrays";
import { Sha256 } from "@aws-crypto/sha256-browser";

import { Chains } from "@/types";
import getCeramicClientInstance from "@/utils/ceramic-client";

const ceramic = getCeramicClientInstance();

export type Auth = {
	id: string;
	did: DID;
	active: boolean;
	chain: Chains;
};

class Authenticate {
	protected auths: Auth[] = [];

	protected account: {
		did: DID | null;
		key: string;
	} = { did: null, key: "" };

	private static instance: Authenticate | null;

	private async connectWallet(id: string, secret: Uint8Array, chain: Chains) {
		const threeIDAuth = await ThreeIdProvider.create({
			ceramic,
			authId: id,
			authSecret: secret,
			getPermission: (request: any) => Promise.resolve(request.payload.paths)
		});

		const did = new DID({
			// Get the DID provider from the 3ID Connect instance
			provider: threeIDAuth.getDidProvider(),
			resolver: {
				...get3IDResolver(ceramic),
				...getKeyResolver()
			}
		});
		// Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
		// authentication flow using 3ID Connect and the Ethereum provider
		await did.authenticate();

		// The Ceramic client can create and update streams using the authenticated DID
		ceramic.did = did;

		// Fetch the Account Stream for this Auth DID -- by using the AuthAccounts Stream
		// This factors in the circumstance where this Auth already belongs to a Account

		// If account in memory does not match the account id from the AuthAccount, merge them
		// if(){
		// }

		// If wallet dids exist
		if (this.auths.length > 0) {
			// If no account DID exists for this given auth DID, then create one here.
			if (this.account.did === null) {
				// ...
			}

			// If wallet DID does not exist, push it and active
			if (!this.auths.find((auth) => auth.did.id === did.id)) {
				this.add({
					id,
					did,
					active: false,
					chain
				});
			}
		} else {
			// Basically, each Auth DID should own a connection to an AuthAccount. The AuthAccount behaves as an Index for all the Authentications made by the User.
			// TODO: Install Glaze suite and learn it.
		}

		return did;
	}

	private add(auth: Auth) {
		this.auths.push(auth);
		this.activate(auth.did);
		// Link auth to account
	}

	private activate(did: DID) {
		this.auths = this.auths.map((auth) => {
			if (auth.did.id === did.id) {
				return {
					...auth,
					active: true
				};
			}
			return {
				...auth,
				active: false
			};
		});

		// The Ceramic client can create and update streams using the authenticated DID
		ceramic.did = did;

		return did;
	}

	public get did() {
		return this.auths.find(({ active }) => active === true);
	}

	/**
	 * Deterministically produced a Cosm wallet for use with ThreeID
	 */
	public async withArweave(
		walletAddress: string,
		arConnectProvider: typeof window.arweaveWallet
	) {
		const arr = uint8arrays.fromString(walletAddress);
		const sig = await arConnectProvider.signature(arr, {
			name: "RSA-PSS",
			saltLength: 0 // This ensures that no additional salt is produced and added to the message signed.
		});

		const hash = new Sha256();
		hash.update(uint8arrays.toString(sig));
		const entropy = await hash.digest();

		const did = await this.connectWallet(
			walletAddress,
			entropy,
			Chains.ARWEAVE
		);

		return did;
	}

	public static async getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
