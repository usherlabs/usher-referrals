import { DID } from "dids";
import * as uint8arrays from "uint8arrays";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import Arweave from "arweave";
import MagicWalletsModelAlias from "@usher/ceramic/models/MagicWallet.json";

import getMagicClient from "@/utils/magic-client";
import { Chains, Wallet, Connections } from "@/types";
import Auth from "./authentication";

const arweave = Arweave.init({
	host: "arweave.net",
	port: 443,
	protocol: "https"
});

class Authenticate {
	protected auths: Auth[] = [];

	private static instance: Authenticate | null;

	private add(auth: Auth) {
		this.auths.push(auth);
	}

	private exists(o: DID | Auth) {
		return !!this.auths.find(
			(auth) => auth.did.id === (o instanceof DID ? o.id : o.did.id)
		);
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

		const auth = new Auth();
		await auth.connect(walletAddress, entropy, [Chains.ARWEAVE], connection);
		const { did } = auth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		return auth;
	}

	/**
	 * Authenticate with Magic -- assumes that user is authenticated
	 *
	 * Create a DID for Magic Eth wallet.
	 * If no existing Magic wallet exists, create a JWK wallet and encrypt with Eth Signer
	 * Push the encrypted JWK wallet to Ceramic under a "MagicWallets" stream
	 */
	public async withMagic(): Promise<[Auth]> {
		const { ethProvider } = getMagicClient();

		const signer = ethProvider.getSigner();
		const address = await signer.getAddress();
		const sig = await signer.signMessage(address);
		const hash = new Sha256();
		hash.update(sig);
		const entropy = await hash.digest();

		const ethAuth = new Auth();
		await ethAuth.connect(
			address,
			entropy,
			[Chains.ETHEREUM],
			Connections.MAGIC
		);
		const { did, ceramic } = ethAuth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(ethAuth.did)) {
			this.add(ethAuth);
		}

		// Check if Arweave wallet exists for the DID
		// For reference, see https://developers.ceramic.network/tools/glaze/example/#5-runtime-usage
		// const store = this.getMagicWalletsStore();
		const model = new DataModel({ ceramic, aliases: MagicWalletsModelAlias });
		const store = new DIDDataStore({ ceramic, model });
		const magicWallet = await store.get("magicWallet");
		let arweaveKey = {};
		let arweaveAddress = "";
		console.log(magicWallet);
		if (!(magicWallet || {}).arweave) {
			// Create Arweave Jwk
			const key = await arweave.wallets.generate();
			const arAddress = await arweave.wallets.jwkToAddress(key);
			// Encrypt the wallet.
			const buf = uint8arrays.fromString(JSON.stringify(key));
			const enc = await did.createJWE(buf, [did.id]);
			const encData = Arweave.utils.stringToB64Url(JSON.stringify(enc));
			await store.set("magicWallet", {
				arweave: {
					address: arAddress,
					data: encData
				}
			});
			arweaveKey = key;
			arweaveAddress = arAddress;
		} else {
			// const decBuf = await did.decryptJWE(arweaveEncJwk);
			// const decStr = uint8arrays.toString(decBuf);
			// let dec = {};
			// try {
			// 	dec = JSON.parse(decStr);
			// } catch (e) {
			// 	// ...
			// }
			// console.log({ key, enc, dec });
			// arweaveKey =
			console.log(magicWallet);
		}

		console.log(magicWallet);

		return [ethAuth];
	}

	// private getMagicWalletsStore() {
	// 	if (!this.magicWalletsStore) {
	// 		const model = new DataModel({ ceramic, aliases: MagicWalletsModelAlias });
	// 		const store = new DIDDataStore({ ceramic, model });
	// 		this.magicWalletsStore = store;
	// 	}
	// 	return this.magicWalletsStore;
	// }

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
