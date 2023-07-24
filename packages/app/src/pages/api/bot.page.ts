import { z } from "zod";
import got from "got";

import { useRouteHandler } from "@/server/middleware";
import { botdSecretKey } from "@/server/env-config";

// See: BotD Types
/**
 * Status of the bot detection.
 */
declare type DetectStatus = "processed" | "notEnoughData" | "error";
/**
 * Detection result note.
 */
declare type DetectNote = {
	status: DetectStatus;
	probability: number;
	type?: string;
};
/**
 * Interface for success response of the bot detection API.
 *
 * @interface SuccessResponse
 */
interface BotdSuccessResponse {
	bot: {
		automationTool: DetectNote;
		searchEngine: DetectNote;
		browserSpoofing: DetectNote;
	};
	vm: DetectNote;
}

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler();

const schema = z.object({
	token: z.string()
});

// Initializing the cors middleware
handler.router.post(async (req, res) => {
	let { body } = req;
	try {
		body = await schema.parseAsync(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { token } = body;

	const response: BotdSuccessResponse = await got
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

export default handler.handle();
