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
	};

	private static instance: Authenticate | null;

	// Fetch the account Link stream and populate the class -- Stream ID is relevant to the Account DID
	private async initAccount() {
		// ...
	}

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

		// If wallet dids exist
		if (this.auths.length > 0) {
			// If wallet DID does not exist, push it and active
			if (!this.auths.find((auth) => auth.did.id === did.id)) {
				// If there is already one authentication, and we're about to add another, initialise the accountDID
				if (this.auths.length === 1) {
					await this.initAccount();
				}

				this.add({
					id,
					did,
					active: false,
					chain
				});
			}
		}

		return did;
	}

	private add(auth: Auth) {
		this.auths.push(auth);
		this.activate(auth.did);
		// Link auth to account
	}

	private activate(did: DID | string) {
		let id = "";
		if (typeof did === "string") {
			id = did;
		} else if (did instanceof DID) {
			id = did.id;
		}

		this.auths = this.auths.map((walletDID) => {
			if (walletDID.did.id === id) {
				return {
					...walletDID,
					active: true
				};
			}
			return {
				...walletDID,
				active: false
			};
		});
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
