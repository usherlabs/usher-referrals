// import { ScheduledEvent } from "aws-lambda";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { NetworkModel } from "@usher.so/datamodels";
import { DataModel } from "@glazed/datamodel";
import { TileLoader } from "@glazed/tile-loader";
import pLimit from "p-limit";
// import allSettled from "promise.allsettled";
// import * as uint8arrays from "uint8arrays";
import { aql } from "arangojs"; // https://arangodb.github.io/arangojs/7.8.0/index.html

import {
	ConversionAction,
	ConversionRecord,
	Conversion,
	Partnership,
	Ingest,
	IngestType
} from "@/types";
import { ceramicUrl } from "@/env-config";
import log from "@/utils/logger";
import getArangoClient from "@/utils/arango-client";
// import getArweave from "@/utils/arweave-client";

// const arweave = getArweave();
const arango = getArangoClient();
const limitPromise = pLimit(1);

// export default async (event: ScheduledEvent) => {
export default async () => {
	const ceramic = new CeramicClient(ceramicUrl);
	const model = new DataModel({
		// @ts-ignore
		ceramic,
		aliases: NetworkModel
	});
	const tileLoader = new TileLoader({
		// @ts-ignore
		ceramic
	});

	// Load Conversions
	const conversionsDoc = await model.loadTile("conversions");
	if (!conversionsDoc) {
		throw new Error("Cannot load Conversions Document Stream");
	}
	// Ingest latest conversions
	// Determine which conversion stream ids that have not been ingested
	const IngestsCollection = arango.collection<Ingest>("Ingests");
	const records = conversionsDoc.content.set as ConversionRecord[];
	const commitId = conversionsDoc.commitId.toString();
	log.info(`Conversions Stream fetched`, {
		streamId: conversionsDoc.id.toString(),
		commitId,
		records: records.length
	});
	// Get the last conversions ingested commit id
	const ingestsCursor = await arango.query(aql`
		FOR ingest IN ${IngestsCollection}
			FILTER ingest.type == "${IngestType.CONVERSION}"
			SORT ingest.created_at DESC
			LIMIT 1
			RETURN ingest
	`);
	let recordsToUse = records;
	if ((ingestsCursor.count || 0) > 0) {
		const ingests = await ingestsCursor.all();
		const lastCommitId = ingests[0].commit_id as string;
		if (lastCommitId === commitId) {
			// No updates since last ingest
			// TODO: Add a return here.
		}
		// Fetch Doc using the lastCommitId
		const conversionsDocAtCommit = await TileDocument.load<{
			set: ConversionRecord[];
		}>(ceramic, lastCommitId);
		if (conversionsDocAtCommit !== null) {
			log.info(`Last ingested commit used to fetch Conversions Stream`, {
				commitId: lastCommitId
			});

			const recordsAtCommit = conversionsDocAtCommit.content
				.set as ConversionRecord[];
			recordsToUse = [];
			// considering this conversions set is an append-only, we'll only look for newly added items.
			for (let i = recordsAtCommit.length - 1; i < records.length; i += 1) {
				recordsToUse.push(records[i]);
			}
		} else {
			log.warn("Last ingest exists but no doc was fetched", {
				ingestId: ingests[0].lastCommitId
			});
		}
	}
	log.info(`${recordsToUse.length} record to ingest`);

	// Execute removal of Conversions marked as delete
	const deleteConversionIds = recordsToUse
		.filter((record) => record.action === ConversionAction.DELETE)
		.map((record) => record.id);
	if (deleteConversionIds.length > 0) {
		await arango.query(aql`
			FOR c IN Conversions
				FILTER ${deleteConversionIds.map((id) => `c.sid == ${id}`).join(" OR ")}
				REMOVE c IN Conversions
		`);
		log.info(`Conversions deleted`, {
			count: deleteConversionIds.length,
			conversions: deleteConversionIds
		});
	}

	// Pull all conversions and validate them
	// Cap at 50 per request
	const insertConversionIds = recordsToUse
		.filter((record) => record.action === ConversionAction.INSERT)
		.map((record) => record.id);
	const chunkSize = 50;
	const validationChunks = [];
	for (let i = 0; i < insertConversionIds.length; i += chunkSize) {
		const chunk = insertConversionIds.slice(i, i + chunkSize);

		validationChunks.push(
			limitPromise(async () => {
				const conversionStreams = await Promise.all(
					chunk.map((id) => tileLoader.load<Conversion>(id))
				);
				const partnerships = await Promise.all(
					conversionStreams.map((doc) =>
						tileLoader.load<Partnership>(doc.content.partnership)
					)
				);
				const conversions = conversionStreams.map((c, j) => ({
					...c.content,
					id: c.id.toString(),
					partnership: {
						id: partnerships[j].id.toString(),
						partnerships: partnerships[j].content
					}
				}));
			})
		);
	}

	await Promise.all(validationChunks);

	// Ingest all the records we marked as ready for ingestion
	// await arango.query(aql`
	// 	LET data = ${JSON.stringify}
	// `)

	// Add new ingest
	const newIngest = {
		type: IngestType.CONVERSION,
		commit_id: commitId,
		created_at: Date.now()
	};
	await arango.query(aql`
		INSERT ${JSON.stringify(newIngest)} INTO ${IngestsCollection}
	`);

	// Load ArCampaigns
	// const arCampaigns = await model.loadTile("ar_campaigns");
	// if (!arCampaigns) {
	// 	throw new Error("Cannot load ArCampaigns Document Stream");
	// }

	// log.info(arCampaigns.content);

	// const campaignIds = arCampaigns.content;
	// const results = await allSettled(
	// 	campaignIds.map(async (id) => {
	// 		const tx = await arweave.transactions.get(id);
	// 		const str = uint8arrays.toString(tx.data);
	// 		const terms = JSON.parse(str) as RawCampaign;
	// 		let reward = {
	// 			name: "Arweave",
	// 			ticker: "AR",
	// 			type: "token",
	// 			limit: terms.reward.limit
	// 		};
	// 		if (terms.reward.address) {
	// 			// ... implement a fetch for reward -- ie. PST or NFT rewards
	// 			throw new Error("PSTs and NFTs are not yet supported!");
	// 		}
	// 		let advertiser = {};
	// 		if (terms.advertiser) {
	// 			const advertiserDoc = await TileDocument.load(
	// 				ceramic,
	// 				terms.advertiser
	// 			);
	// 			advertiser = advertiserDoc.content;
	// 		}
	// 		const campaignDetailsDoc = await TileDocument.load(
	// 			cermaic,
	// 			terms.details
	// 		);
	// 	})
	// );
};
