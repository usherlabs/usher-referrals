/* ========== BASE ========== */

export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";
export const appName = `${process.env.APP_NAME}@${process.env.APP_VERSION}`;

/* ========== TRACKING ========== */
export const sentry = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
	release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || appName
};

export const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "";
export const logrocketAppId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || "";

/* ========== DATA/API ========== */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const ceramicUrl =
	process.env.NEXT_PUBLIC_CERAMIC_URL || "http://localhost:7007";
export const ceramicNetwork =
	process.env.NEXT_PUBLIC_CERAMIC_NETWORK || "local";

export const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

/* ========== SECURITY ========== */
export const inviteOrigin = process.env.NEXT_PUBLIC_INVITE_ORIGIN;

export const botdPublicKey = process.env.NEXT_PUBLIC_BOTD_PUBLIC_KEY;
