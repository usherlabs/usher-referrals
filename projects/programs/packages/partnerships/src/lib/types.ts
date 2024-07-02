import { Chains } from "@usher.so/shared";

export type CampaignReference = {
	chain: Chains;
	address: string;
};

export type Partnership = {
	id: string;
	campaign: CampaignReference;
};
