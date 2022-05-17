import {
	AuthProvider,
	asOldCaipString,
	getConsentMessage,
	LinkProof
} from "@ceramicnetwork/blockchain-utils-linking";

import { AccountId } from "caip";
import * as uint8arrays from "uint8arrays";

export class ArweaveAuthProvider implements AuthProvider {
	readonly isAuthProvider = true;

	readonly algorithm = "RSASSA-PKCS1-v1_5";

	constructor(
		private readonly provider: typeof window.arweaveWallet,
		private readonly address: string
	) {}

	async accountId(): Promise<AccountId> {
		const chainId = `ar:`;
		return new AccountId({ address: this.address, chainId });
	}

	async authenticate(message: string): Promise<string> {
		const arr = uint8arrays.fromString(message);
		const sig = await this.provider.signature(arr, this.algorithm);
		const response = uint8arrays.toString(sig);
		return response;
	}

	async createLink(did: string): Promise<LinkProof> {
		const { message, timestamp } = getConsentMessage(did, true);
		const arr = uint8arrays.fromString(message);
		const sig = await this.provider.signature(arr, this.algorithm);
		const accountId = await this.accountId();
		const signature = uint8arrays.toString(sig);
		return {
			version: 2,
			message,
			signature,
			account: asOldCaipString(accountId),
			timestamp
		};
	}

	withAddress(address: string): AuthProvider {
		return new ArweaveAuthProvider(this.provider, address);
	}
}
