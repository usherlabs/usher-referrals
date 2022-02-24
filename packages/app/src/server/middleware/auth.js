import nextConnect from "next-connect";

import { supabase } from "@/utils/supabase-client";

const withAuth = nextConnect().use(async (req, res, next) => {
	if (!req.token) {
		return res.status(403).json({
			success: false
		});
	}

	const user = await supabase.auth.api.getUser(req.token);

	req.user = user;

	return next();
});

export default withAuth;
