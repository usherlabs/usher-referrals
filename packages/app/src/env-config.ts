/* ========== BASE ========== */

export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";
export const appName = `${process.env.APP_NAME}@${process.env.APP_VERSION}`;
export const useSeedData = process.env.NEXT_PUBLIC_USE_SEED_DATA === "true";

/* ========== TRACKING ========== */
export const sentry = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
	release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || appName
};

export const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "";
export const logrocketAppId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || "";

/* ========== DATA/API ========== */
export const ceramicUrl =
	process.env.NEXT_PUBLIC_CERAMIC_URL || "https://ceramic-clay.3boxlabs.com";

export const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export const magicPublicKey = process.env.NEXT_PUBLIC_MAGIC_KEY;

export const arangoUrl = process.env.ARANGO_URL || "http://127.0.0.1:8529";
export const arangoDatabase = process.env.ARANGO_DATABASE;
export const arangoUsername = process.env.ARANGO_USERNAME;
export const arangoPassword = process.env.ARANGO_PASSWORD;

/* ========== SECURITY ========== */
export const inviteOrigin = process.env.NEXT_PUBLIC_INVITE_ORIGIN;

export const botdPublicKey = process.env.NEXT_PUBLIC_BOTD_PUBLIC_KEY;
