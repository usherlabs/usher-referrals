import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
import { BaseLogger } from "pino";

/**
 * ###### ENUMS ######
 */

export enum ContractConflictStrategy {
	OVERWRITE = "OVERWRITE",
	PASSTHROUGH = "PASSTHROUGH"
}

/**
 * ###### TYPES ######
 */

export type Wallet = {
	network: string;
	address: string;
};

export type Partnerships = {
	id: string;
	records: {
		id: number;
		hits: number;
		conversions: { pending: number; successful: number };
	}[];
};

export type User = {
	id: string;
	wallet: Wallet;
	partnerships: Partnerships;
	verifications: {
		captcha: boolean;
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
	log: BaseLogger;
}

export interface AuthApiRequest extends ApiRequest {
	token: string;
	user: User;
}

export interface ApiResponse extends NextApiResponse {}

/**
 * ###### INTERFACES ######
 */

export interface IWalletActions {
	setWallet: (state: Wallet) => void;
	removeWallet: () => void;
	getWallet: (shouldConnect: boolean) => Promise<string>;
}

export interface IWalletContext extends IWalletActions {
	wallet: Wallet;
	loading: boolean;
	isArConnectLoaded: boolean;
}

export interface IContractActions {
	getContract: () => Promise<Contract>;
}

export interface IContractContext extends IContractActions {
	contract: Contract;
	loading: boolean;
}

export interface IUserActions {
	setUser: (user: User | null) => void;
	removeUser: () => void;
	getUser: () => Promise<User | null>;
}

export interface IUserContext extends IUserActions {
	user: User;
	loading: boolean;
}
