/**
 * ###### ENUMS ######
 */

export enum ConversionAction {
	INSERT = "insert",
	DELETE = "delete"
}

export enum IngestType {
	CONVERSION = "conversion",
	AR_CAMPAIGN = "ar_campaign"
}

/**
 * ###### TYPES ######
 */

export type ConversionRecord = {
	id: string;
	action: ConversionAction;
};

export type Conversion = {
	partnership: string;
	message: string;
	sig: string;
	seed: string;
	event_id: number;
	native_id: string;
	metadata: { key: string; value: string }[];
	commit: number;
};

export type CampaignReference = {
	chain: string;
	address: string;
};

export type Partnership = {
	id: string;
	campaign: CampaignReference;
};

export type ExpandedConversion = Conversion & {
	id: string;
	partnership: Partnership;
};

export type ClaimedRewards = {
	id: string;
	conversions: string[]; // An array of conversion ids
	created_at: number;
};

export type Ingest = {
	id: string;
	type: IngestType;
	commit_id: string; // The Ceramic Commit ID for the ingested data "set".
	created_at: number;
};

/**
 * ###### INTERFACES ######
 */
