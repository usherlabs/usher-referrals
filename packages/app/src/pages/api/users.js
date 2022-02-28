/**
 * Add authorised user to the Discord Server.
 */

import getHandler from "@/server/middleware";
import auth from "@/server/middleware/auth";
import discord from "@/server/discord";
import { discord as discordEnv } from "@/server/env-config";

const handler = getHandler();

handler.use(auth).post(async (req, res) => {
	const {
		user_metadata: { provider_id: providerId }
	} = req.user;

	try {
		const response = await discord
			.put(`/guilds/${discordEnv.guildId}/members/${providerId}`, {
				access_token: req.session.provider_token
			})
			.then(({ data }) => data);

		return res.json({
			success: true,
			response
		});
	} catch (e) {
		console.log(e);
		return res.json({
			success: false
		});
	}
});

export default handler;
