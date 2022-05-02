/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import got from "got";
import FormData from "form-data";
// import ono from "@jsdevtools/ono";

import getHandler from "@/server/middleware";
import auth from "@/server/middleware/auth";
import { hcaptchaSecretKey } from "@/server/env-config";
import { AuthApiRequest, ApiResponse } from "@/types";
import { prisma } from "@usher/prisma";

const handler = getHandler();

handler
	.use(auth)
	.get(async (req: AuthApiRequest, res: ApiResponse) => {
		const { id: userId } = req.user; // invitee user

		try {
			const result = await prisma.captchaLogEntries.count({
				where: {
					profiles: {
						user_id: userId
					}
				},
				orderBy: {
					created_at: "desc"
				}
			});

			return res.json({
				success: result > 0
			});
		} catch (e) {
			req.log.error(e);
			return res.json({
				success: false
			});
		}
	})
	.post(async (req: AuthApiRequest, res: ApiResponse) => {
		const { id: userId, profile } = req.user; // invitee user
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

		try {
			const entry = await prisma.captchaLogEntries.create({
				data: {
					token,
					is_success: response.success,
					response,
					profile_id: profile.id
				}
			});
			req.log.info({ db: { entry }, userId }, "Insert User Captcha Log Entry");
		} catch (e) {
			req.log.error(e);
			return res.json({
				success: false
			});
		}

		return res.json({
			success: response.success
		});
	});

export default handler;
