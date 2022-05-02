/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import got from "got";
import FormData from "form-data";
import ono from "@jsdevtools/ono";

import getHandler from "@/server/middleware";
import auth from "@/server/middleware/auth";
import { supabase } from "@/utils/supabase-client";
import { hcaptchaSecretKey } from "@/server/env-config";
import { AuthApiRequest, ApiResponse } from "@/types";

const handler = getHandler();

handler.use(auth).post(async (req: AuthApiRequest, res: ApiResponse) => {
	const { id: userId } = req.user; // invitee user
	const { token } = req.body;

	req.log.info({ params: { userId, token } }, "Captcha verification");

	if (!token) {
		return res.status(400).json({
			success: false
		});
	}

	const formData = new FormData();
	formData.append("secret", hcaptchaSecretKey);
	formData.append("response", token);
	const response: { success: boolean } = await got
		.post("https://hcaptcha.com/siteverify", {
			body: formData
		})
		.json();

	req.log.info({ captcha: { response } }, "Captcha repsonse");

	const sIns = await supabase.from("user_captcha_log_entries").insert({
		token,
		is_success: response.success,
		response,
		user_id: userId
	});
	if (sIns.error && sIns.status !== 406) {
		throw ono(sIns.error, "user_captcha_log_entries");
	}
	req.log.info({ db: sIns, userId }, "Insert User Captcha Log Entry");

	return res.json({
		success: response.success
	});
});

export default handler;
