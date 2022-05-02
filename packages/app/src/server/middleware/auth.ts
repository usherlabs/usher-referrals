import nextConnect from "next-connect";
import { NextApiResponse } from "next";
import { prisma } from "@usher/prisma";

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
		if (user === null) {
			return next(new Error("User not found"));
		}

		let profile = await prisma.profiles.findUnique({
			where: {
				user_id: user.id
			},
			select: {
				id: true
			}
		});
		if (!profile) {
			profile = await prisma.profiles.create({
				data: {
					user_id: user.id
				}
			});
		}

		req.session = payload;
		req.user = { ...user, profile };

		return next();
	}
);

export default withAuth;
