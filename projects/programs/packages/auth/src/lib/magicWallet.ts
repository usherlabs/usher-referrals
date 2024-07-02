import { Chains, Connections } from "@usher.so/shared";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { DID } from "dids";
import * as uint8arrays from "uint8arrays";

import { Authenticate } from "./authenticate.js";
import { MagicWalletAuth } from "./magicWalletAuth.js";
import { WalletAuth } from "./walletAuth.js";

export class MagicWallet {
	constructor(private authInstance: Authenticate, private arweave: Arweave) {}

	async loadArweaveAuth(ethAuth: WalletAuth) {
		// Check if Arweave wallet exists for the DID
		// For reference, see https://developers.ceramic.network/tools/glaze/example/#5-runtime-usage
		const magicEthAuth = new MagicWalletAuth(ethAuth);
		const magicWallets = await magicEthAuth.getMagicWallets();
		let arweaveKey: JWKInterface;
		let arweaveAddress = "";
		if (!(magicWallets || {}).arweave) {
			// Create Arweave Jwk
			const key = await this.arweave.wallets.generate();
			const arAddress = await this.arweave.wallets.jwkToAddress(key);
			// Encrypt the wallet.
			const buf = uint8arrays.fromString(JSON.stringify(key));
			const { did } = ethAuth;
			const jwe = await did.createJWE(buf, [did.id]);
			const encData = Arweave.utils.stringToB64Url(JSON.stringify(jwe));
			magicEthAuth.addMagicWallet({
				arweave: {
					address: arAddress,
					data: encData,
				},
			});
			arweaveKey = key;
			arweaveAddress = arAddress;
		} else {
			const { data } = magicWallets.arweave;
			const jwk = await this.processMagicArweaveJwk(ethAuth.did, data);
			arweaveAddress = await this.arweave.wallets.jwkToAddress(jwk);
			arweaveKey = jwk;
		}

		// withAreave includes the loadOwnerForAuth method already
		const arAuth = await this.authInstance.withArweave(
			arweaveAddress,
			Connections.MAGIC,
			MagicWallet.nativeArweaveProvider(arweaveKey)
		);

		return arAuth;
	}

	/**
	 * Get JWK associated to Magic Wallet
	 *
	 * @return  {JWKInterface}
	 */
	public async getMagicArweaveJwk() {
		const auths = this.authInstance.getAll();
		const ethAuth = auths.find(
			(a) =>
				a.wallet.connection === Connections.MAGIC &&
				a.wallet.chain === Chains.ETHEREUM
		);
		if (!ethAuth) {
			throw new Error("Genisis Magic Wallet not Connected");
		}
		const magicEthAuth = new MagicWalletAuth(ethAuth);
		const magicWallets = await magicEthAuth.getMagicWallets();
		if (!(magicWallets || {}).arweave) {
			throw new Error("Magic Arweave Wallet not Connected");
		}
		const { data } = magicWallets.arweave;
		const jwk = await this.processMagicArweaveJwk(ethAuth.did, data);
		return jwk;
	}

	private async processMagicArweaveJwk(
		genisisDid: DID,
		data: string
	): Promise<JWKInterface> {
		const str = Arweave.utils.b64UrlToString(data);
		const enc = JSON.parse(str);
		const dec = await genisisDid.decryptJWE(enc);
		const keyStr = uint8arrays.toString(dec);
		const jwk = JSON.parse(keyStr);
		return jwk as JWKInterface;
	}

	private static nativeArweaveProvider(jwk: JWKInterface) {
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
							name: "SHA-256",
						},
					},
					false,
					["sign"]
				);
				// For reference, see: https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/webcrypto-driver.ts#L48
				const sig = await crypto.subtle.sign(algorithm, k, data);
				return new Uint8Array(sig);
			},
		};
	}
}
