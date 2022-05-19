import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
// import { BaseLogger } from "pino";

/**
 * ###### ENUMS ######
 */

export enum ContractConflictStrategy {
	OVERWRITE = "OVERWRITE",
	PASSTHROUGH = "PASSTHROUGH"
}

export enum Chains {
	ARWEAVE = "arweave"
	// ETHEREUM = "ethereum",
	// POLYGON = "polygon"
}

export enum Connections {
	MAGIC = "magic",
	ARCONNECT = "arconnect"
}

/**
 * ###### TYPES ######
 */

export type Wallet = {
	chains: Chains[]; // Some wallets can belong to more than one Blockchain
	connection: Connections;
	address: string;
	active: boolean; // Whether the wallet is the actively connected wallet
};

export type Partnership = {
	id: number;
	campaign: {
		network: Chains;
		address: string;
	};
};

export type Profile = {
	email: string;
};

export type User = {
	id: string; // Affiliate DID
	wallets: Wallet[];
	partnerships: Partnership[];
	verifications: {
		personhood: boolean;
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
	conflictStrategy: ContractConflictStrategy;
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
}

export interface IUserContext extends IUserActions {
	user: User;
	loading: boolean;
}
