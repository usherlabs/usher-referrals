/**
 * POST: Add authorised user to the Discord Server / Guide.
 * GET: Fetch an Invite link to the Discord Server Channel -- Also add a record of the invitee
 *
 * Both Invitees and Ushers are going to use the same Auth
 */

import pick from "lodash/pick";
import getHandler from "@/server/middleware";
import auth from "@/server/middleware/auth";
import discord from "@/server/discord";
import { discord as discordEnv } from "@/server/env-config";
import { supabase } from "@/utils/supabase-client";

const handler = getHandler();

handler
	.use(auth)
	.get(async (req, res) => {
		const { id } = req.user; // invitee user
		const { id: walletId } = req.query;

		if (!walletId) {
			return res.status(400).json({
				success: false
			});
		}

		const response = await discord
			.post(`/channels/${discordEnv.inviteChannelId}/invites`, {
				max_age: 3600, // 1 hour
				max_uses: 0,
				temporary: false,
				unique: false
			})
			.then(({ data }) => data);

		if (!response.code) {
			req.log.warn("No code in invite creation", response);
			return res.status(400).json({
				success: false
			});
		}
		req.log.info("Discord code successfully created", response);

		// Create a new "invite" between the invitee and the usher/wallet
		const { error, status } = await supabase.from("invites").insert({
			user_id: id,
			wallet_id: walletId,
			provider_code: response.code
		});
		if (error && status !== 406) {
			throw error;
		}

		return res.json({
			success: true,
			data: pick(response, ["code", "expires_at", "created_at"])
		});
	})
	.post(async (req, res) => {
		const {
			user_metadata: { provider_id: providerId }
		} = req.user; // usher user

		try {
			await discord
				.put(`/guilds/${discordEnv.guildId}/members/${providerId}`, {
					access_token: req.session.provider_token
				})
				.then(({ data }) => data);

			return res.json({
				success: true
			});
		} catch (e) {
			req.log.error(e);
			return res.json({
				success: false
			});
		}
	});

export default handler;
