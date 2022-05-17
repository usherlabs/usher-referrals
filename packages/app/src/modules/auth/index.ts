import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { AuthProvider, ThreeIdConnect } from "@3id/connect";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";

import { ArweaveAuthProvider } from "./3id-arweave-auth-provider";

// Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
const threeID = new ThreeIdConnect();
const ceramic = new CeramicClient();

class Authenticate {
	protected did: DID | null;

	private static instance: Authenticate | null;

	constructor() {
		this.did = null;
	}

	private async connect(authProvider: AuthProvider) {
		if (this.did !== null) {
			// DID already established... meaning all future connects are links to the existing DID.
			// The Caip10Link manages this merge mechanism, automatically... -- see https://developers.ceramic.network/reference/stream-programs/caip10-link/
			const accountId = await authProvider.accountId();
			const accountLink = await Caip10Link.fromAccount(
				ceramic,
				accountId.toString()
			);
			// `accountLink.did` -- can be used to access the independent DID, but we want to link it to the currently connected DID.
			await accountLink.setDid(this.did, authProvider);
			return this.did;
		}

		await threeID.connect(authProvider);

		const did = new DID({
			// Get the DID provider from the 3ID Connect instance
			provider: threeID.getDidProvider(),
			resolver: {
				...get3IDResolver(ceramic),
				...getKeyResolver()
			}
		});
		// Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
		// authentication flow using 3ID Connect and the Ethereum provider
		await did.authenticate();

		this.did = did;

		// The Ceramic client can create and update streams using the authenticated DID
		ceramic.did = did;

		return did;
	}

	public getDID() {
		return this.did;
	}

	// As seen here: https://developers.ceramic.network/reference/accounts/3id-did/#3id-connect
	public async withArweave(
		walletAddress: string,
		arConnectProvider: typeof window.arweaveWallet
	) {
		const authProvider = new ArweaveAuthProvider(
			arConnectProvider,
			walletAddress
		);
		return this.connect(authProvider);
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
