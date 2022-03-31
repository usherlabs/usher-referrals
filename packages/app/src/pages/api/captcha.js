/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import got from "got";
import FormData from "form-data";
import cors from "cors";
import * as yup from "yup";

import getHandler from "@/server/middleware";
import { hcaptchaSecretKey } from "@/server/env-config";

const handler = getHandler();

const schema = yup.object({
	token: yup.string().required()
});

handler.use(cors()).post(async (req, res) => {
	let { body } = req;
	try {
		body = await schema.validate(body);
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
	const response = await got
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
