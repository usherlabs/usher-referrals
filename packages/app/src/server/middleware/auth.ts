import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import { AuthApiRequest } from "@/types";
import { supabase } from "@/utils/supabase-client";

const withAuth = nextConnect().use(
	async (req: AuthApiRequest, res: NextApiResponse, next) => {
		if (!req.token) {
			return res.status(403).json({
				success: false
			});
		}
		let payload;
		try {
			payload = JSON.parse(Buffer.from(req.token, "base64").toString("utf-8"));
		} catch (e) {
			return res.status(403).json({
				success: false
			});
		}

		const { user, error } = await supabase.auth.api.getUser(
			payload.access_token
		);

		if (error) {
			return next(error);
		}

		req.session = payload;
		req.user = user;

		return next();
	}
);

export default withAuth;
