/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import got from "got";
import FormData from "form-data";
import { z } from "zod";

import { ApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import { hcaptchaSecretKey } from "@/server/env-config";

const handler = getHandler();

const schema = z.object({
	token: z.string()
});

handler.post(async (req: ApiRequest, res: ApiResponse) => {
	let { body } = req;
	try {
		body = await schema.parseAsync(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { token } = body;

	req.log.info(
		{ params: { token } },
		"End-user Bot Prevention Captcha verification"
	);

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

	return res.json({
		success: response.success
	});
});

export default handler;
