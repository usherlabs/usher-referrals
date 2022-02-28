export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl = process.env.PUBLIC_URL || "";

export const discord = {
	guildId: process.env.DISCORD_GUILD_ID || ""
};
