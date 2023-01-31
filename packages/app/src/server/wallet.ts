import { getArangoClient } from "@/utils/arango-client";
import { Chains, Connections } from "@usher.so/shared";
import { aql } from "arangojs";

const arango = getArangoClient();

type WalletDoc = {
	_id: string;
	_key: string;
	chain: Chains;
	address: string;
	connections: Connections[];
};

/**
 * Fetches a Wallet Id from arangodb database
 * @param chain
 * @param address
 * @returns Wallet Id stored in the database. `undefined` if Wallet not found.
 */
export async function fetchWallet(
	chain: string,
	address: string
): Promise<WalletDoc> {
	const cursor = await arango.query(aql`
		RETURN DOCUMENT(Wallets, ${[chain, address].join(":")})
	`);

	const result = await cursor.all();
	return result[0];
}

/**
 * Saves a Wallet to the database
 * @param chain Wallet's chain
 * @param address Wallet's address
 * @param connections Wallet's connection
 * @returns Wallet Id stored in the database
 */
export async function createWallet(
	chain: string,
	address: string,
	connections: Connections[]
): Promise<WalletDoc> {
	const cursor = await arango.query(aql`
		INSERT {
			_key: ${[chain, address].join(":")},
			chain: ${chain},
			address: ${address},
			connections: ${connections},
		} INTO Wallets OPTIONS { waitForSync: true }
		RETURN NEW
	`);

	const result = await cursor.all();
	return result[0];
}

/**
 * Saves a Wallet to the database
 * @param chain Wallet's chain
 * @param address Wallet's address
 * @param connections Wallet's connection
 * @returns Wallet Id stored in the database
 */
export async function updateWallet(
	chain: string,
	address: string,
	connections: Connections[]
): Promise<WalletDoc> {
	const cursor = await arango.query(aql`
		UPDATE {
			_key: ${[chain, address].join(":")},
			connections: ${connections},
		} IN Wallets OPTIONS { waitForSync: true }
		RETURN NEW
	`);

	const result = await cursor.all();
	return result[0];
}

/**
 * Checks if the Wallet is already referred by the Partnership.
 * @param walletId Wallet identifier in the database, i.e. `Wallets/[cahin]:[address]`
 * @param partnership Partnership identifier in the database, i.e. `[key]`
 * @returns `boolean`
 */
export async function isWalletReferred(
	walletId: string,
	partnership: string
): Promise<boolean> {
	const cursor = await arango.query(aql`
		FOR referral IN Referrals
		FILTER
				referral._from == CONCAT("Partnerships/", ${partnership}) &&
				referral._to == ${walletId}
		RETURN referral
	`);
	return (await cursor.all()).length !== 0;
}

/**
 * Refers the Wallet to the Partnership.
 * @param walletId Wallet identifier in the database, i.e. `Wallets/[cahin]:[address]`
 * @param partnership Partnership identifier in the database, i.e. `[key]`
 */
export async function referWallet(walletId: string, partnership: string) {
	await arango.query(aql`
		INSERT {
			_from: CONCAT("Partnerships/", ${partnership}),
			_to: ${walletId}
		} INTO Referrals
	`);
}
