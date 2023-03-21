import { getArangoClient } from "@/utils/arango-client";
import { Connections } from "@usher.so/shared";

const arango = getArangoClient();

/**
 * Fetches the Wallets connected by visiting the Link.
 * @param linkKey Link document `_key` attribute
 * @param didKeys `_key` attributes of the DID documents that owns the Link
 */
export async function fetchConnectionsByLink(
	linkKey: string,
	didKeys: string[]
): Promise<
	{
		address: string;
		timestamp: number;
		connection: Connections;
	}[]
> {
	const cursor = await arango.query({
		query: `
LET link = DOCUMENT(Links, @linkKey)

LET dids = DOCUMENT(Dids, @didKeys)
LET relatedDids = (
	FOR did in dids
		FOR rd IN 1..1 ANY did Related
			COLLECT _id = rd._id
				RETURN _id)

LET uniquedDids = UNION_DISTINCT(FOR did IN dids RETURN did._id, relatedDids)

FOR did IN 1..1 ANY link Engagements
    FILTER POSITION(uniquedDids, did._id)
		FOR wallet, connection IN 1..1 OUTBOUND link Connections
			SORT connection.timestamp DESC
			RETURN {
					_id: connection._id,
					address: wallet.address,
					timestamp: connection.timestamp,
					connection: connection.connection
			}
`,
		bindVars: {
			linkKey,
			didKeys
		}
	});

	const result = await cursor.all();
	return result;
}

/**
 * Fetches the Wallets connected by visiting the Link.
 * @param linkKey Link document `_key` attribute
 * @param walletKey Wallet document `_key` attribute
 * @param didKeys `_key` attributes of the DID documents that owns the Link
 */
export async function fetchConnectionsByLinkAndWallet(
	linkKey: string,
	walletKey: string,
	didKeys: string[]
): Promise<
	{
		address: string;
		timestamp: number;
		connection: Connections;
	}[]
> {
	const cursor = await arango.query({
		query: `
LET link = DOCUMENT(Links, @linkKey)

LET dids = DOCUMENT(Dids, @didKeys)
LET relatedDids = (
	FOR did in dids
		FOR rd IN 1..1 ANY did Related
			COLLECT _id = rd._id
				RETURN _id)

LET uniquedDids = UNION_DISTINCT(FOR did IN dids RETURN did._id, relatedDids)

FOR did IN 1..1 ANY link Engagements
    FILTER POSITION(uniquedDids, did._id)
		FOR wallet, connection IN 1..1 OUTBOUND link Connections
		    FILTER wallet._key == @walletKey
			SORT connection.timestamp DESC
			RETURN {
					_id: connection._id,
					address: wallet.address,
					timestamp: connection.timestamp,
					connection: connection.connection
			}
`,
		bindVars: {
			linkKey,
			walletKey,
			didKeys
		}
	});

	const result = await cursor.all();
	return result;
}

/**
 * Creates a Connection from the link to the Wallet
 * @param walletKey Wallet document `_key` attribute in format [chain:address]
 * @param linkKey Link document `_key` attribute
 */
export async function createLinkConnection(
	linkKey: string,
	walletKey: string,
	connection: Connections
): Promise<string> {
	const cursor = await arango.query({
		query: `
INSERT {
	_from: DOCUMENT(Links, @linkKey)._id,
	_to: DOCUMENT(Wallets, @walletKey)._id,
	connection: @connection,
	timestamp: @timestamp
} INTO Connections OPTIONS { waitForSync: true }
RETURN NEW._id
`,
		bindVars: {
			linkKey,
			walletKey,
			connection,
			timestamp: Date.now()
		}
	});

	const [result] = await cursor.all();
	return result;
}
