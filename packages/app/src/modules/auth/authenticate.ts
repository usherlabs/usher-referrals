import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { ThreeIdProvider } from "@3id/did-provider";
import * as uint8arrays from "uint8arrays";
import { Sha256 } from "@aws-crypto/sha256-browser";

import { Chains, Wallet, Connections } from "@/types";
import getCeramicClientInstance from "@/utils/ceramic-client";
import Auth from "./authentication";

const ceramic = getCeramicClientInstance();

class Authenticate {
	protected auths: Auth[] = [];

	private static instance: Authenticate | null;

	private static async connect(id: string, secret: Uint8Array) {
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

		return did;
	}

	private add(auth: Auth) {
		this.auths.push(auth);
		this.activate(auth.did);
	}

	private exists(o: DID | Auth) {
		return !!this.auths.find(
			(auth) => auth.did.id === (o instanceof DID ? o.id : o.did.id)
		);
	}

	public activate(param: DID | Auth | string) {
		let did: DID;
		if (typeof param === "string") {
			const target = this.auths.find((auth) => auth.address === param);
			if (!target) {
				throw new Error(`Address is not found or authenticated`);
			}
			did = target.did;
		} else if (!(param instanceof DID)) {
			did = param.did;
		} else {
			did = param;
		}

		// The Ceramic client can create and update streams using the authenticated DID
		ceramic.did = did;

		return did;
	}

	public getAuth(address: string) {
		return this.auths.find((auth) => auth.address === address);
	}

	public getWallets(): Wallet[] {
		return this.auths.map((auth) => {
			return auth.wallet;
		});
	}

	public getAll() {
		return this.auths;
	}

	/**
	 * Deterministically produce a secret for DID production
	 */
	public async withArweave(
		walletAddress: string,
		provider: typeof window.arweaveWallet,
		connection: Connections
	): Promise<Auth> {
		const arr = uint8arrays.fromString(walletAddress);
		const sig = await provider.signature(arr, {
			name: "RSA-PSS",
			saltLength: 0 // This ensures that no additional salt is produced and added to the message signed.
		});

		const hash = new Sha256();
		hash.update(uint8arrays.toString(sig));
		const entropy = await hash.digest();

		const did = await Authenticate.connect(walletAddress, entropy);
		const auth = new Auth(did, {
			address: walletAddress,
			chains: [Chains.ARWEAVE],
			connection
		});
		await auth.load();

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		return auth;
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
