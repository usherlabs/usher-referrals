import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { NetworkModel } from "@usher/ceramic";
import allSettled from "promise.allsettled";
import uint8arrays from "uint8arrays";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import getArweave from "@/utils/arweave-client";
import { IDIDDataStore, IDataModel, Chains, RawCampaign } from "@/types";
import { ceramic } from "@/utils/ceramic-client";

const arweave = getArweave();

class Campaigns {
	private static instance: Campaigns | null;

	private model: IDataModel;

	private store: IDIDDataStore;

	constructor() {
		const model = new DataModel({
			ceramic,
			aliases: NetworkModel
		});
		const store = new DIDDataStore({ ceramic, model });
		this.model = model;
		this.store = store;
	}

	/**
	 * Fetch all campaigns
	 *
	 * TODO: Make chains parameter optional, and fetch all
	 * TODO: Add limit and pagination to this method to minimise data fetched
	 *
	 */
	public async getAll(chain: Chains) {
		switch (chain) {
			case Chains.ARWEAVE: {
				const doc = await this.model.loadTile("ar_campaigns");
				if (!doc) {
					throw new Error("Cannot load ArCampaigns Document Stream");
				}
				const campaignIds = doc.content;
				const results = await allSettled(
					campaignIds.map(async (id) => {
						const tx = await arweave.transactions.get(id);
						const str = uint8arrays.toString(tx.data);
						const terms = JSON.parse(str) as RawCampaign;
						let reward = {
							name: "Arweave",
							ticker: "AR",
							type: "token",
							limit: terms.reward.limit
						};
						if (terms.reward.address) {
							// ... implement a fetch for reward -- ie. PST or NFT rewards
							throw new Error("PSTs and NFTs are not yet supported!");
						}
						let advertiser = {};
						if (terms.advertiser) {
							const advertiserDoc = await TileDocument.load(
								ceramic,
								terms.advertiser
							);
							advertiser = advertiserDoc.content;
						}
						const campaignDetailsDoc = await TileDocument.load(
							cermaic,
							terms.details
						);
					})
				);
				return [];
			}
			default: {
				break;
			}
		}
	}

	public async get(id: string, chain: Chains) {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new Campaigns();
		}
		return this.instance;
	}
}

export default Campaigns;
