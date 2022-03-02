/**
 * Add authorised user to the Discord Server.
 */

import isEmpty from "lodash/isEmpty";
import pick from "lodash/pick";
import getHandler from "@/server/middleware";
import { supabase } from "@/utils/supabase-client";
import discord from "@/server/discord";
import { discord as discordEnv } from "@/server/env-config";

const handler = getHandler();

handler.get(async (req, res) => {
	const { id } = req.query;
	if (!id) {
		return res.status(400).json({
			success: false
		});
	}
	try {
		const { error, data, status } = await supabase
			.from("wallets")
			.select("user_id, address, id")
			.eq("id", id)
			.maybeSingle();
		if (error && status !== 406) {
			throw error;
		}

		if (isEmpty(data)) {
			return res.status(400).json({
				success: false
			});
		}

		const { data: user } = await supabase.auth.api.getUserById(data.user_id);
		const profile = {
			avatar_url: user.user_metadata?.avatar_url,
			name: user.user_metadata?.full_name,
			username: user.user_metadata?.name
		};

		// Get guild name and channel name too.
		const guild = await discord
			.get(`/guilds/${discordEnv.guildId}`)
			.then(({ data: d }) => d);
		const channel = await discord
			.get(`/channels/${discordEnv.inviteChannelId}`)
			.then(({ data: d }) => d);

		return res.json({
			success: true,
			data: {
				...data,
				profile,
				channel: pick(channel, ["name"]),
				guild: {
					name: guild.name,
					icon_url: guild.icon
						? `https://cdn.discordapp.com/icons/${discordEnv.guildId}/${guild.icon}.png`
						: ""
				}
			}
		});
	} catch (e) {
		req.log.error(e);
		return res.status(400).json({
			success: false
		});
	}
});

export default handler;
