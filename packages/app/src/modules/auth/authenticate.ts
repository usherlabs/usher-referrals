import { DID } from "dids";
import * as uint8arrays from "uint8arrays";
import { Sha256 } from "@aws-crypto/sha256-browser";
import Arweave from "arweave";

import getMagicClient from "@/utils/magic-client";
import getArweaveClient from "@/utils/arweave-client";
import { Chains, Wallet, Connections } from "@/types";
import Auth from "./authentication";

const arweave = getArweaveClient();

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
		const auth = this.auths.find((a) => a.address === address);
		if (auth) {
			return auth;
		}
		throw new Error(`No Auth found for wallet ${address}`);
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
		provider:
			| typeof window.arweaveWallet
			| {
					signature: (
						data: Uint8Array,
						algorithm: RsaPssParams
					) => Promise<Uint8Array>;
			  },
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
		await auth.connect(walletAddress, entropy, Chains.ARWEAVE, connection);
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
	public async withMagic(): Promise<Auth[]> {
		const { ethProvider } = getMagicClient();

		const signer = ethProvider.getSigner();
		const address = await signer.getAddress();
		const sig = await signer.signMessage(address);
		const hash = new Sha256();
		hash.update(sig);
		const entropy = await hash.digest();

		const ethAuth = new Auth();
		await ethAuth.connect(address, entropy, Chains.ETHEREUM, Connections.MAGIC);
		const { did } = ethAuth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(ethAuth.did)) {
			this.add(ethAuth);
		}

		// Check if Arweave wallet exists for the DID
		// For reference, see https://developers.ceramic.network/tools/glaze/example/#5-runtime-usage
		const magicWallets = await ethAuth.getMagicWallets();
		let arweaveKey = {};
		let arweaveAddress = "";
		if (!(magicWallets || {}).arweave) {
			// Create Arweave Jwk
			const key = await arweave.wallets.generate();
			const arAddress = await arweave.wallets.jwkToAddress(key);
			// Encrypt the wallet.
			const buf = uint8arrays.fromString(JSON.stringify(key));
			const enc = await did.createJWE(buf, [did.id]);
			const encData = Arweave.utils.stringToB64Url(JSON.stringify(enc));
			ethAuth.addMagicWallet({
				arweave: {
					address: arAddress,
					data: encData,
					created_at: Date.now()
				}
			});
			arweaveKey = key;
			arweaveAddress = arAddress;
		} else {
			const { data } = magicWallets.arweave;
			const str = Arweave.utils.b64UrlToString(data);
			const enc = JSON.parse(str);
			const dec = await did.decryptJWE(enc);
			const keyStr = uint8arrays.toString(dec);
			const jwk = JSON.parse(keyStr);
			arweaveAddress = await arweave.wallets.jwkToAddress(jwk);
			arweaveKey = jwk;
		}

		const arAuth = await this.withArweave(
			arweaveAddress,
			Authenticate.nativeArweaveProvider(arweaveKey),
			Connections.MAGIC
		);

		return [ethAuth, arAuth];
	}

	private static nativeArweaveProvider(jwk: Object) {
		return {
			// We're reimplementing the signature mechanism to allow for 0 salt length -- as the ArweaveJS forces 32
			async signature(data: Uint8Array, algorithm: RsaPssParams) {
				// For reference, see https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/webcrypto-driver.ts#L110
				const k = await crypto.subtle.importKey(
					"jwk",
					jwk,
					{
						name: "RSA-PSS",
						hash: {
							name: "SHA-256"
						}
					},
					false,
					["sign"]
				);
				// For reference, see: https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/webcrypto-driver.ts#L48
				const sig = await crypto.subtle.sign(algorithm, k, data);
				return new Uint8Array(sig);
			}
		};
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
