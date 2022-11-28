import { CampaignReference } from "@usher.so/partnerships";
import { getArangoClient } from "@/utils/arango-client";
import { aql } from "arangojs";
import { ArangoError } from "arangojs/error";
import pino from "pino";

const arango = getArangoClient();

/**
 * Ensures that the partnership has been indexed
 * @param partnership
 * @param campaignRef
 * @param controller
 * @param log
 * @returns
 */
export async function indexPartnership(
	partnership: string,
	campaignRef: CampaignReference,
	controller: string,
	log: pino.Logger
): Promise<boolean> {
	const dataCursor = await arango.query(aql`
	RETURN {
		partnership: DOCUMENT("Partnerships", ${partnership}),
		campaign: DOCUMENT("Campaigns", ${[campaignRef.chain, campaignRef.address].join(
			":"
		)})
	}
`);
	const dataResults = await dataCursor.all();
	const [{ partnership: partnershipData, campaign: campaignData }] =
		dataResults;

	if (!campaignData) {
		log.warn(
			{
				vars: {
					partnership,
					campaignRef
				}
			},
			"Campaign does not exist"
		);
		return false;
	}

	if (partnershipData) {
		log.info(
			{ vars: { partnership, results: dataResults } },
			"Partnership already indexed"
		);
	} else {
		log.info({ vars: { partnership, controller } }, "Indexing Partnership...");
		try {
			const cursor = await arango.query(aql`
			INSERT {
				_key: ${partnership},
				created_at: ${Date.now()},
				hits: 0,
				rewards: 0
			} INTO Partnerships OPTIONS { waitForSync: true }
			LET p = NEW
			UPSERT { _key: ${controller} }
			INSERT { _key: ${controller}, created_at: ${Date.now()} }
			UPDATE {}
			IN Dids OPTIONS { waitForSync: true }
			LET edges = (
				FOR params IN [
					{
						_from: p._id,
						_to: ${`Campaigns/${[campaignRef.chain, campaignRef.address].join(":")}`}
					},
					{
						_from: CONCAT("Dids/", ${controller}),
						_to: p._id
					}
				]
					INSERT {
						_from: params._from,
						_to: params._to
					} INTO Engagements
					RETURN NEW
			)
			RETURN {
				p,
				edges
			}
		`);

			const results = await cursor.all();
			log.info({ results }, "Partnership indexed");
		} catch (e) {
			if (e instanceof ArangoError && e.errorNum === 1200) {
				log.warn({ conflictErr: e }, "Arango Conflict Error");
			} else {
				throw e;
			}
		}
	}
	return true;
}
