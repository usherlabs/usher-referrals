/**
 * GET: Accepts encypted token from Advertiser page and signs the message
 * POST: Verifies the conversion and saves it.
 */

import { z } from "zod";
import got from "got";
import { Base64 } from "js-base64";

import { ApiResponse, ApiRequest } from "@/types";
import getHandler from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { Referral } from "@/types";

const handler = getHandler();

const schema = z.object({
	partnership: z.string(),
	token: z.string().optional()
});

// Initializing the cors middleware
handler.post(async (req: ApiRequest, res: ApiResponse) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { token } = body;
	const did = await getAppDID();

	let isNew = true;
	if (token) {
		try {
			const jwe = JSON.parse(Base64.decode(token)) as JWE;
			const raw = did.decryptJWE(jwe);
			const sp = raw.split(".");
			const referralId = sp.shift();
			const partnershipIdFromToken = sp.join(".");
			if (partnershipIdFromToken === partnership) {
			}
		} catch (e) {
			req.log.error({ token }, "Could not decrypt conversion cookie token");
		}
	}

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

export default handler;
