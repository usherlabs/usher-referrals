/**
 * POST: Receives a Captcha Token and verifies against the hcaptcha service
 */

import { z } from "zod";

import { ApiRequest, ApiResponse } from "@/types";
import getHandler from "@/server/middleware";
import captcha from "@/server/captcha";

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

	const response: { success: boolean } = await captcha(token);

	req.log.info({ captcha: { response } }, "Captcha repsonse");

	return res.json({
		success: response.success
	});
});

export default handler;
