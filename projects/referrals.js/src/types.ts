export enum ConflictStrategy {
	OVERWRITE = "overwrite",
	PASSTHROUGH = "passthrough"
}

export type Config = {
	apiUrl?: string;
	conflictStrategy?: ConflictStrategy;
};

export type CampaignReference = {
	chain: string;
	id: string;
};

export type Conversion = CampaignReference & {
	eventId: number;
	nativeId?: string;
	metadata?: Record<string, string | number | boolean>;
	commit?: number;
};

export type ConversionResponse = { conversion: string; partnership: string };
