import { randomString } from "@stablelib/random";
import {
	Chains,
	Connections,
	EVMBasedChain,
	EVMBasedChainList,
	Wallet,
} from "@usher.so/shared";
import Arweave from "arweave";
import { DID } from "dids";
import { ethers } from "ethers";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { AuthOptions } from "./options.js";
import { WalletAuth } from "./walletAuth.js";

type StoredWallet = Wallet & {
	signature: string;
};

function getStoredWallets() {
	// TODO: This is currently only available on Web ... and not so friendly. To make this compatible with ethProvider in Node.js environment.
	let prevWalletData = "[]";
	if (typeof window !== "undefined") {
		const item = window.localStorage.getItem("connectedWallets");
		if (item) {
			prevWalletData = item;
		}
	}
	const previouslyConnectedWallets = JSON.parse(
		prevWalletData
	) as StoredWallet[];
	return previouslyConnectedWallets;
}

export class Authenticate {
	protected auths: WalletAuth[] = [];

	constructor(
		private providers: {
			arweave?: Arweave;
			ethereum?: ethers.providers.Web3Provider;
			magic?: ethers.providers.Web3Provider;
		},
		private authOptions?: AuthOptions
	) {}

	private add(auth: WalletAuth) {
		this.auths.push(auth);
	}

	private exists(o: DID | WalletAuth) {
		return !!this.auths.find(
			(auth) => auth.did.id === (o instanceof DID ? o.id : o.did.id)
		);
	}

	// Removes auths that are similar to the provided authentication -- but not the provided authentication
	private removeSimilar(auth: WalletAuth) {
		// First remove the existing similar authentication
		const existingSimilarAuthIndex = this.auths.findIndex(
			(a) =>
				a.wallet.connection === auth.wallet.connection &&
				a.wallet.chain === auth.wallet.chain &&
				a.wallet.address !== auth.wallet.address // -- but not the provided authentication
		);
		if (existingSimilarAuthIndex >= 0) {
			this.auths.splice(existingSimilarAuthIndex, 1);
		}
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

	public removeAll() {
		this.auths = [];
	}

	public setProvider(
		key: "ethereum" | "magic" | "arweave",
		provider: ethers.providers.Web3Provider | Arweave
	) {
		if (key === "arweave") {
			this.providers[key] = provider as Arweave;
		}
		if (key === "ethereum" || key === "magic") {
			this.providers[key] = provider as ethers.providers.Web3Provider;
		}
	}

	/**
	 * A method to retrieve a verifiable token
	 * For use with Server communication
	 *
	 * @return  {string}  AuthToken
	 */
	public async getAuthToken() {
		const nonce = randomString(32);
		const parts = await Promise.all(
			this.auths.map(async (auth) => {
				const sig = await auth.did.createJWS(nonce, { did: auth.did.id });
				return [auth.did.id, sig, [auth.wallet.chain, auth.wallet.address]];
			})
		);
		const s = JSON.stringify(parts);
		const token = Base64.encode(s);

		return token;
	}

	/**
	 * Deterministically produce a secret for DID production
	 */
	public async withArweave(
		address: string,
		connection: Connections,
		provider:
			| typeof window.arweaveWallet
			| {
					signature: (
						data: Uint8Array,
						algorithm: RsaPssParams
					) => Promise<Uint8Array>;
			  }
	): Promise<WalletAuth> {
		const auth = new WalletAuth(
			{
				address,
				chain: Chains.ARWEAVE,
				connection,
			},
			this.authOptions
		);

		const sig = await provider.signature(uint8arrays.fromString(auth.id), {
			name: "RSA-PSS",
			saltLength: 0, // This ensures that no additional salt is produced and added to the message signed.
		});
		await auth.connect(sig);
		const { did } = auth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		return auth;
	}

	public async withEVMBasedChain(
		address: string,
		connection: Connections,
		chain: EVMBasedChain
	): Promise<WalletAuth> {
		const auth = new WalletAuth(
			{
				address,
				chain,
				connection,
			},
			this.authOptions
		);

		if (!EVMBasedChainList.includes(chain)) {
			console.warn(`EVMBasedChain ${chain} not supported`);
			return auth;
		}

		const previouslyConnectedWallets = getStoredWallets();

		const [connectedWallet] = previouslyConnectedWallets.filter(
			(wallet) =>
				wallet.connection === connection &&
				wallet.chain === chain &&
				wallet.address === address
		);

		if (!connectedWallet) {
			throw new Error("No wallet found");
		}

		const sig = uint8arrays.fromString(connectedWallet.signature);

		await auth.connect(sig);
		const { did } = auth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		return auth;
	}

	/**
	 * Deterministically produce a secret for DID production
	 */
	public async withEthereum(
		address: string,
		connection: Connections
	): Promise<WalletAuth> {
		const auth = new WalletAuth(
			{
				address,
				chain: Chains.ETHEREUM,
				connection,
			},
			this.authOptions
		);
		const previouslyConnectedWallets = getStoredWallets();

		const [connectedWallet] = previouslyConnectedWallets.filter(
			(wallet) =>
				wallet.connection === connection &&
				wallet.chain === Chains.ETHEREUM &&
				wallet.address === address
		);

		if (!connectedWallet) {
			throw new Error("No wallet found");
		}

		const sig = uint8arrays.fromString(connectedWallet.signature);

		await auth.connect(sig);
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
	public async withMagic(): Promise<WalletAuth> {
		if (!this.providers.magic) {
			throw new Error("Magic Provider not loaded");
		}
		const signer = this.providers.magic.getSigner();
		const address = await signer.getAddress();
		const auth = new WalletAuth(
			{
				address,
				chain: Chains.ETHEREUM,
				connection: Connections.MAGIC,
			},
			this.authOptions
		);

		const sig = await signer.signMessage(auth.id);
		await auth.connect(uint8arrays.fromString(sig));

		// If wallet DID does not exist, push and activate it
		if (!this.exists(auth.did)) {
			this.add(auth);
		}

		return auth;
	}
}
