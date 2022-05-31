import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
// import { BaseLogger } from "pino";

/**
 * ###### ENUMS ######
 */

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
	OVERWRITE = "OVERWRITE",
	PASSTHROUGH = "PASSTHROUGH"
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

export type Campaign = {
	id: string;
	owner: string;
	events: {
		strategy: CampaignStrategies;
		rate: number;
		limit: number;
	}[];
	reward: {
		name: string;
		ticker: string;
		type: RewardTypes;
		limit: number;
	};
	conflictStrategy: CampaignConflictStrategy;
	details: {
		destinationUrl: string;
		name: string;
		description?: string;
		image?: string;
		externalLink?: string;
	};
	advertiser: {
		name?: string;
		icon?: string;
		description?: string;
		externalLink?: string;
		twitter?: string;
	};
};

export type Wallet = {
	chain: Chains;
	connection: Connections;
	address: string;
	partnerships: Partnership[];
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
	verifications: {
		personhood: number | null; // here we store the timestamp that the user was verified.
		captcha: boolean;
	};
	profile: Profile;
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

export type Token = {
	name: string;
	ticker: string;
	type: string;
};

export type Contract = {
	strategy: string;
	rate: number;
	token: Token;
	limit: number;
	conflictStrategy: string;
};

// Server Types

export interface ApiRequest extends NextApiRequest {
	// log: BaseLogger;
}

export interface AuthApiRequest extends ApiRequest {
	token: string;
	user: User;
}

export interface ApiResponse extends NextApiResponse {}

/**
 * ###### INTERFACES ######
 */

export interface IContractActions {
	getContract: () => Promise<Contract>;
}

export interface IContractContext extends IContractActions {
	contract: Contract;
	loading: boolean;
}

export interface IUserActions {
	getUser: (type: Connections) => Promise<User>;
	connect: (type: Connections) => Promise<User>;
	disconnect: (type: Connections) => Promise<void>;
	setCaptcha: (value: boolean) => void;
	setProfile: (value: Profile) => void;
	addPartnership: (
		walletData: string | Wallet,
		partnership: CampaignReference
	) => Promise<void>;
}

export interface IUserContext extends IUserActions {
	user: User;
	loading: boolean;
}
