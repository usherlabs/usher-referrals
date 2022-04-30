import { NextPageContext, NextApiRequest, NextApiResponse } from "next";
import { User as UserType, Session } from "@supabase/supabase-js";

export type User = UserType & {
	verifications?: {
		captcha: boolean;
	};
};

export type AuthApiRequest = NextApiRequest & {
	token: string;
	session: Session;
	user: User | null;
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
