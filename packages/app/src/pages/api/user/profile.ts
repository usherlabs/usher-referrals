/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import getHandler from "@/server/middleware";
import auth from "@/server/middleware/auth";
import { AuthApiRequest, ApiResponse } from "@/types";

const handler = getHandler();

handler.use(auth).get(async (req: AuthApiRequest, res: ApiResponse) => {
	const { profile } = req.user; // invitee user

	return res.json({
		success: true,
		profile
	});
});

export default handler;
