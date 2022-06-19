// import { ScheduledEvent } from "aws-lambda";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { NetworkModel } from "@usher/ceramic";
import { DataModel } from "@glazed/datamodel";
// import { DataModel } from "@usher/ceramic/dist/shims/datamodel";
// import allSettled from "promise.allsettled";
// import * as uint8arrays from "uint8arrays";
// import { TileDocument } from "@ceramicnetwork/stream-tile";

import { ceramicUrl } from "@/env-config";
import log from "@/utils/logger";
// import getArweave from "@/utils/arweave-client";

// const arweave = getArweave();

// export default async (event: ScheduledEvent) => {
export default async () => {
	const ceramic = new CeramicClient(ceramicUrl);
	const model = new DataModel({
		// @ts-ignore
		ceramic,
		aliases: NetworkModel
	});

	// Load Conversions
	const conversionsDoc = await model.loadTile("conversions");
	if (!conversionsDoc) {
		throw new Error("Cannot load Conversions Document Stream");
	}

	// Ingest latest conversions
	log.info(conversionsDoc.content);

	// Load ArCampaigns
	const arCampaigns = await model.loadTile("ar_campaigns");
	if (!arCampaigns) {
		throw new Error("Cannot load ArCampaigns Document Stream");
	}

	log.info(arCampaigns.content);

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
