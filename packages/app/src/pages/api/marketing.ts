/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import { z } from "zod";
import got from "got";
import FormData from "form-data";

import { ApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";

const handler = getHandler();

const schema = z.object({
	email: z.string()
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
	const { email } = body;

	req.log.info("Save email to marketing app");

	if (!email) {
		return res.status(400).json({
			success: false
		});
	}

	const formData = new FormData();
	formData.append("mauticform[formId]", "1");
	formData.append("mauticform[return]", "");
	formData.append("mauticform[formName]", "usherappform");
	formData.append("mauticform[messenger]", "1");
	formData.append("mauticform[email]", email);
	const response = await got.post(
		"https://marketing.usher.so/form/submit?formId=1",
		{
			body: formData
		}
	);

	return res.json({
		success: response.statusCode >= 200 && response.statusCode < 300
	});
});

export default handler;
