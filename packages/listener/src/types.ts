/**
 * ###### ENUMS ######
 */

export enum Chains {
	ARWEAVE = "arweave",
	ETHEREUM = "ethereum"
	// POLYGON = "polygon"
}

export enum CampaignStrategies {
	FLAT = "flat",
	PERCENTAGE = "percentage"
}

export enum RewardTypes {
	TOKEN = "token",
	NFT = "nft",
	PST = "pst"
}

/**
 * ###### TYPES ######
 */

export type Advertiser = {
	name?: string;
	icon?: string;
	description?: string;
	externalLink?: string;
	twitter?: string;
};

export type CampaignDetails = {
	destinationUrl: string;
	name: string;
	description?: string;
	image?: string;
	externalLink?: string;
};

export type CampaignReward = {
	name: string;
	ticker: string;
	type: RewardTypes;
	// A limit on the rewards for the entire campaign. When limit is reached, no more rewards can be claimed.
	limit?: number;
	// An address for the PST, ERC20, etc.
	address?: string;
};

export type Campaign = {
	id: string;
	chain: Chains;
	owner: string;
	events: {
		// The strategy for which to calculate the rewards. Flat rewards are calculated per event. Percentage based rewards are calculated based on an amount value submitted at the point of conversion.
		strategy: CampaignStrategies;
		// The reward rate for the event
		rate: number;
		// An arbitrary value that limits the conversions that can be processed for this given event for the referred/native user.
		// Where a Conversion.nativeId is provided, rather than restricting conversions to 1 per referred/native user,
		// 		the referred user can continue converting until the total of Conversion.commit meets this nativeLimit
		nativeLimit?: number;
		// If no reward "perCommit" is defined, the behaviour is standard (ie. X reward rate per Conversion)
		// Otherwise, the reward amount can be relative to the commit value in the conversion -- ie. reward = rate * (commit / perCommit)
		perCommit?: number;
		// Some description for when the event will trigger.
		description?: string;
		// Contract Address
		contractAddress?: string;
		// Contract Event
		contractEvent?: string;
	}[];
	reward: CampaignReward;
	details: CampaignDetails;
	advertiser: Advertiser;
	rewardsClaimed?: number;
	disableVerification?: boolean;
	unlisted?: boolean;
	whitelist?: {
		partners: string[];
		externalLink: string;
	};
	attributable?: boolean;
};

export type Conversion = {
	id: string;
	partnership: string;
	message: string;
	sig: string;
	eventId: number;
	createdAt: number;
	convertedAt: number;
	nativeId: string | null;
	metadata: Record<string, string | number | boolean> | null;
	commit: number | null;
};
