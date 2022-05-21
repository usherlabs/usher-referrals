import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import {
	AuthProvider,
	ThreeIdConnect,
	EthereumAuthProvider
} from "@3id/connect";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";
// import { ThreeIdProvider } from "@3id/did-provider";
import * as uint8arrays from "uint8arrays";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { ethers } from "ethers";

import { Chains } from "@/types";
import getMagicClient from "@/utils/magic-client";
import { ceramicNetwork } from "@/env-config";
import getCeramicClientInstance from "@/utils/ceramic-client";

// Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
const threeID = new ThreeIdConnect(ceramicNetwork);
const ceramic = getCeramicClientInstance();
const magic = getMagicClient();

class Authenticate {
	protected did: DID | null;

	protected chains: Chains[] = [];

	private static instance: Authenticate | null;

	constructor() {
		this.did = null;
	}

	/**
	 * Used for Blockchains compatible with CAIP-10 and ThreeIDConnect
	 * https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/blockchain-utils-linking
	 *
	 * 3ID Connect:
	 * https://developers.ceramic.network/reference/accounts/3id-did/#3id-connect
	 */
	private async connect(authProvider: AuthProvider) {
		if (this.did !== null) {
			// if(this.chains.length === 1 && this.chains.includes(Chains.ARWEAVE)){
			// 	return this.linkArweave();
			// }
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

	/**
	 * Deterministically produced a eip115 wallet for use with ThreeID
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

		const mnemonic = ethers.utils.entropyToMnemonic(entropy);
		const caipWallet = ethers.Wallet.fromMnemonic(mnemonic);
		// @ts-ignore
		// const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
		// const provider = new ethers.providers.StaticJsonRpcProvider(
		// 	"https://eth-mainnet.alchemyapi.io/v2/Vr62QipjNeuLST97u1AKQAeDWxUJ2zKl",
		// 	"homestead"
		// );
		const provider = new ethers.providers.AlchemyProvider(
			"homestead",
			"Vr62QipjNeuLST97u1AKQAeDWxUJ2zKl"
		);
		// "https://eth-mainnet.alchemyapi.io/v2/Vr62QipjNeuLST97u1AKQAeDWxUJ2zKl"
		const authProvider = new EthereumAuthProvider(provider, caipWallet.address);

		return this.connect(authProvider);

		// const threeIDAuth = await ThreeIdProvider.create({
		// 	ceramic,
		// 	authId: walletAddress,
		// 	authSecret: res,
		// 	getPermission: (request: any) => Promise.resolve(request.payload.paths)
		// });

		// const did = new DID({
		// 	// Get the DID provider from the 3ID Connect instance
		// 	provider: threeIDAuth.getDidProvider(),
		// 	resolver: {
		// 		...get3IDResolver(ceramic),
		// 		...getKeyResolver()
		// 	}
		// });
		// // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
		// // authentication flow using 3ID Connect and the Ethereum provider
		// await did.authenticate();

		// // The Ceramic client can create and update streams using the authenticated DID
		// ceramic.did = did;

		// this.did = did;
		// this.chains.push(Chains.ARWEAVE);

		// return "";
	}

	// /**
	//  * A method for creating a Ceramic Document indicating ownership of an Arweave wallet/did
	//  *
	//  * @return  {[type]}  [return description]
	//  */
	// public async linkArweave() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Authenticate();
		}
		return this.instance;
	}
}

export default Authenticate;
