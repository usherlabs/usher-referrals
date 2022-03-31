export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

export const sentry = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
	release:
		process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
		`${process.env.APP_NAME}@${process.env.APP_VERSION}`
};

export const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "";
export const logrocketAppId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || "";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const advertiser = {
	usherContractAddress:
		process.env.NEXT_PUBLIC_ADVERTISER_USHER_CONTRACT_ADDRESS,
	destinationUrl: process.env.NEXT_PUBLIC_ADVERTISER_DESTINATION_URL
};

export const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export const inviteOrigin = process.env.NEXT_PUBLIC_INVITE_ORIGIN;
