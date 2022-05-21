export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl = process.env.PUBLIC_URL || "";

export const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "";

export const discord = {
	// clientId: process.env.DISCORD_CLIENT_ID || "";
	// clientSecret: process.env.DISCORD_CLIENT_SECRET || "";
	guildId: process.env.DISCORD_GUILD_ID || "",
	inviteChannelId: process.env.DISCORD_INVITE_CHANNEL_ID || "",
	botToken: process.env.DISCORD_BOT_TOKEN || ""
};

export const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY;

export const inviteProtect = process.env.INVITE_PROTECT;

export const botdSecretKey = process.env.BOTD_SECRET_KEY;

export const postmarkApiKey = process.env.POSTMARK_API_KEY;

export const postmarkTemplates = {
	signIn: process.env.POSTMARK_TEMPLATE_ID_SIGN_IN,
	signUp: process.env.POSTMARK_TEMPLATE_ID_SIGN_UP
};

export const emailFrom = process.env.EMAIL_FROM;

export const magicSecretKey = process.env.MAGIC_SECRET_KEY;
