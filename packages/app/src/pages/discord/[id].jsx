import { setCookie } from "nookies";
import discord from "@/server/discord";
import { discord as discordEnv } from "@/server/env-config";
import handleException from "@/utils/handle-exception";

const DiscordInvite = () => null;

/**
 * 1. Create a referrer cookie
 * 2. Redirect to dynamic Discord Invite Link
 *
 * @return  {Object}  props
 */
export async function getServerSideProps({
	req,
	res,
	query: { wallet: referrerWallet }
}) {
	setCookie({ req, res }, "__usher-discord-src", referrerWallet, {
		maxAge: 7 * 60 * 60, // lasts 7 days
		path: "/"
	});

	// A new invite link will be produced and used effectively immediatley.
	try {
		const response = await discord
			.post(`/channels/${discordEnv.inviteChannelId}/invites`, {
				max_age: 3600, // 1 hour
				max_uses: 0,
				temporary: false,
				unique: false
			})
			.then(({ data }) => data);

		res.writeHead(302, {
			Location: `https://discord.gg/${response.code}`
		});
	} catch (e) {
		handleException(e.response);
		res.writeHead(302, {
			Location: `/link-error`
		});
	}

	res.end();

	return { props: {} };
}

export default DiscordInvite;
