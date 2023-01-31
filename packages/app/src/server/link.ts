import { aql } from "arangojs";
import { ArangoError } from "arangojs/error";
import pino from "pino";

import { getArangoClient } from "@/utils/arango-client";

const arango = getArangoClient();

/**
 * Ensures that the partnership has been indexed
 * @param linkId
 * @param controller
 * @param log
 * @returns
 */
export async function indexLink(
	linkId: string,
	controller: string,
	log: pino.Logger
) {
	const dataCursor = await arango.query(aql`
  	RETURN {
  		link: DOCUMENT("Links", ${linkId})
	  }
  `);
	const dataResults = await dataCursor.all();
	const [{ link: linkData }] = dataResults;

	if (linkData) {
		log.info(
			{ vars: { linkId, results: dataResults } },
			"Link already indexed"
		);
	} else {
		log.info({ vars: { linkId, controller } }, "Indexing Link...");
		try {
			const cursor = await arango.query(aql`
        INSERT {
          _key: ${linkId},
          created_at: ${Date.now()},
          hits: 0,
          redirects: 0
        } INTO Links OPTIONS { waitForSync: true }
        LET link = NEW

        UPSERT { _key: ${controller} }
        INSERT { _key: ${controller}, created_at: ${Date.now()} }
        UPDATE {}
        IN Dids OPTIONS { waitForSync: true }

        INSERT {
          _from: CONCAT("Dids/", ${controller}),
          _to: link._id
        } INTO Engagements OPTIONS { waitForSync: true }
        LET edge = NEW

        RETURN {
  				link,
	  			edge
		  	}
  		`);

			const results = await cursor.all();
			log.info({ results }, "Link indexed");
		} catch (e) {
			if (e instanceof ArangoError && e.errorNum === 1200) {
				log.warn({ conflictErr: e }, "Arango Conflict Error");
			} else {
				throw e;
			}
		}
	}
}

export async function fetchLinkStats(didKeys: string[]): Promise<
	{
		id: string;
		hits: number;
		redirects: number;
	}[]
> {
	const cursor = await arango.query({
		query: `
LET dids = DOCUMENT(Dids, @didKeys)
LET relatedDids = (
	FOR did in dids
		FOR rd IN 1..1 ANY did Related
			COLLECT _id = rd._id
				RETURN _id)
LET uniquedDids = UNION_DISTINCT(dids, relatedDids)
FOR did IN uniquedDids
	FOR link IN 1..1 OUTBOUND did Engagements
		FILTER STARTS_WITH(link._id, "Links")
		RETURN {
			id: link._key,
			hits: link.hits,
			redirects: link.redirects
		}
`,
		bindVars: {
			didKeys
		}
	});

	return cursor.all();
}

export async function incrementLinkHits(linkKey: string) {
	const cursor = await arango.query({
		query: `
LET link = DOCUMENT(Links, @linkKey)
UPDATE link WITH {
    hits: link.hits + 1
} IN Links OPTIONS { waitForSync: true }
`,
		bindVars: {
			linkKey
		}
	});
	await cursor.all();
}

export async function incrementLinkRedirects(linkKey: string) {
	const cursor = await arango.query({
		query: `
LET link = DOCUMENT(Links, @linkKey)
UPDATE link WITH {
	redirects: link.redirects + 1
} IN Links OPTIONS { waitForSync: true }
`,
		bindVars: {
			linkKey
		}
	});
	await cursor.all();
}
