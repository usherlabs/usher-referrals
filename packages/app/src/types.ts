import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
// import { BaseLogger } from "pino";
import { DataModel } from "@glazed/datamodel";
import { DIDDataStore } from "@glazed/did-datastore";
import { ModelTypeAliases } from "@glazed/types";

/**
 * ###### ENUMS ######
 */

export enum Breakpoints {
	xSmall = 480,
	small = 600,
	medium = 768,
	large = 889,
	xLarge = 1200
}

export enum Chains {
	ARWEAVE = "arweave",
	ETHEREUM = "ethereum"
	// POLYGON = "polygon"
}

export enum Connections {
	MAGIC = "magic",
	ARCONNECT = "ar_connect"
}

export enum CampaignConflictStrategy {
	OVERWRITE = "overwrite",
	PASSTHROUGH = "passthrough"
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
	}[];
	reward: CampaignReward;
	conflictStrategy: CampaignConflictStrategy;
	details: CampaignDetails;
	advertiser: Advertiser;
	rewardsClaimed?: number;
};

export type Wallet = {
	chain: Chains;
	connection: Connections;
	address: string;
};

export type CampaignReference = {
	chain: Chains;
	address: string;
};

export type Partnership = {
	id: string;
	campaign: CampaignReference;
};

export type Profile = {
	email: string;
};

export type User = {
	wallets: Wallet[];
	partnerships: Partnership[];
	verifications: {
		personhood: boolean | number | null; // here we store the timestamp that the user was verified.
		captcha: boolean;
	};
	profile: Profile;
};

export type PartnershipMetrics = {
	partnerships: string[];
	hits: number;
	conversions: {
		pending: number;
		successful: number;
	};
	rewards: number;
};

export type Referral = {
	isNew: boolean;
	token: string;
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

export type ConversionTrack = {
	id: string; // Campaign ID
	chain: Chains;
	eventId: number;
	nativeId?: string;
	metadata?: Record<string, string | number | boolean>;
	commit?: number;
};

export type Claim = {
	amount: number;
	tx: {
		id: string;
		url: string;
	};
};

export type Exception = Error & {
	statusCode?: number;
};

export type ExceptionContext =
	| (NextPageContext & {
			req: NextApiRequest;
			res: NextApiResponse;
			errorInfo?: Record<string, any> | null;
	  })
	| null;

// Server Types

export type AuthUser = {
	did: string;
	wallet: {
		chain: string;
		address: string;
	};
}[]; // An array of verified dids

/**
 * ###### INTERFACES ######
 */
export interface ApiRequest extends NextApiRequest {
	// log: BaseLogger;
}

export interface AuthApiRequest extends ApiRequest {
	token: string;
	user: AuthUser;
}

export interface ApiResponse extends NextApiResponse {}

export interface IDIDDataStore
	extends DIDDataStore<
		ModelTypeAliases<
			Record<string, any>,
			Record<string, string>,
			Record<string, string>
		>,
		string
	> {}
export interface IDataModel
	extends DataModel<
		ModelTypeAliases<
			Record<string, any>,
			Record<string, string>,
			Record<string, string>
		>,
		any
	> {}

export interface IUserActions {
	connect: (type: Connections) => Promise<void>;
	disconnect: (type: Connections) => Promise<void>;
	setCaptcha: (value: boolean) => void;
	setPersonhood: (value: boolean) => void;
	setProfile: (value: Profile) => void;
	addPartnership: (partnership: CampaignReference) => Promise<void>;
}

export interface IUserContext extends IUserActions {
	user: User;
	loading: boolean;
}
