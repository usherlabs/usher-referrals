import cors from "cors";
import * as yup from "yup";
import got from "got";

import getHandler from "@/server/middleware";
import { botdSecretKey } from "@/server/env-config";

const handler = getHandler();

const schema = yup.object({
	token: yup.string().required()
});

// Initializing the cors middleware
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

	const response = await got
		.post("https://botd.fpapi.io/api/v1/verify", {
			json: {
				secretKey: botdSecretKey,
				requestId: token
			}
		})
		.json();

	req.log.info({ botd: { requestId: token, response } }, "Botd response");

	if (
		response.bot.automationTool.probability < 0.2 &&
		response.bot.browserSpoofing.probability < 0.2 &&
		response.bot.searchEngine.probability < 0.3 &&
		response.vm.probability < 0.3
	) {
		return res.json({
			success: true
		});
	}

	return res.json({
		success: false // assume all visitors are bots
	});
});

export default handler;
