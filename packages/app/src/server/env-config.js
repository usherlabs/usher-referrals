export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl = process.env.PUBLIC_URL || "";

export const discord = {
	// clientId: process.env.DISCORD_CLIENT_ID || "";
	// clientSecret: process.env.DISCORD_CLIENT_SECRET || "";
	guildId: process.env.DISCORD_GUILD_ID || "",
	inviteChannelId: process.env.DISCORD_INVITE_CHANNEL_ID || "",
	botToken: process.env.DISCORD_BOT_TOKEN || ""
};
