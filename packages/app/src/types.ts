import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
// import { BaseLogger } from "pino";
import { Authenticate } from "@usher.so/auth";
import {
	CampaignReference,
	Partnership,
	Partnerships
} from "@usher.so/partnerships";
import { Connections, Wallet } from "@usher.so/shared";
import { StoredWallet } from "@/utils/wallets/stored-wallets";

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

/**
 * ###### TYPES ######
 */

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
	lastClaimedAt: number;
	campaign: {
		claimed: number;
	};
};

export type Referral = {
	token: string;
	url: string;
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

export type Claim = {
	to: string;
	fee: number;
	amount: number;
	tx?: {
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

export interface IUserActions {
	// this was modified to support quickly multi chain setup, and should be revised
	// when we support multi wallets
	// connect: (type: Connections) => Promise<void>;
	connect: (type: StoredWallet) => Promise<void>;
	disconnect: (type: Connections) => Promise<void>;
	setCaptcha: (value: boolean) => void;
	setPersonhood: (value: boolean) => void;
	setProfile: (value: Profile) => Promise<void> | void;
	addPartnership: (partnership: CampaignReference) => Promise<void> | void;
}

export interface IUserContext extends IUserActions {
	auth: Authenticate;
	user: User;
	partnerships: Partnerships;
	loading: boolean;
	isAuthenticated: boolean;
}
