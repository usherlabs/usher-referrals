export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";
export const appName = `${process.env.APP_NAME}@${process.env.APP_VERSION}`;

/* ========== TRACKING ========== */
export const sentry = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
	release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || appName
};

/* ========== DATA/API ========== */
export const ceramicUrl =
	process.env.NEXT_PUBLIC_CERAMIC_URL || "https://ceramic-clay.3boxlabs.com";
