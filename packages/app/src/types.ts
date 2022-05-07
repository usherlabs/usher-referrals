import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
import { User as UserType, Session, ApiError } from "@supabase/supabase-js";
import { BaseLogger } from "pino";
import { GunRoot } from "@/utils/gun-client";

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

export type Profile = {
	id: string;
};

export type User = UserType & {
	profile: Profile;
	verifications?: {
		captcha: boolean;
	};
};

export type SignInOptions = { email: string; wallet: string };

export type Exception = (ApiError | Error) & {
	statusCode?: number;
};

export type ExceptionContext =
	| (NextPageContext & {
			req: NextApiRequest;
			res: NextApiResponse;
			errorInfo?: Record<string, any> | null;
	  })
	| null;

export type PartnershipLink = {
	id: string;
	conversions: {
		total: number;
		pending: number;
		success: number;
	};
};

export type Wallet = {
	address: string;
	link: PartnershipLink;
};

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
	session: Session;
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
	signIn: (options: SignInOptions) => Promise<{ success: boolean }>;
	signOut: () => Promise<{ error: ApiError | null }>;
}

export interface IUserContext extends IUserActions {
	user: User | null;
	loading: boolean;
}

export interface IGunContext {
	loading: boolean;
}
