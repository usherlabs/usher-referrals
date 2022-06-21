import pkg from "../package.json";

export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";
export const appName = `${process.env.APP_NAME || pkg.name}@${
	process.env.APP_VERSION || pkg.version
}`;

/* ========== TRACKING ========== */
export const sentry = {
	dsn: process.env.SENTRY_DSN || "",
	release: process.env.SENTRY_RELEASE || appName
};

/* ========== DATA/API ========== */
export const ceramicUrl =
	process.env.CERAMIC_URL || "https://ceramic-clay.3boxlabs.com";

export const arangoUrl = process.env.ARANGO_URL || "http://127.0.0.1:8529";
export const arangoDatabase = process.env.ARANGO_DATABASE;
export const arangoUsername = process.env.ARANGO_USERNAME;
export const arangoPassword = process.env.ARANGO_PASSWORD;

export const s3Region = process.env.S3_REGION;
export const s3Bucket = process.env.S3_BUCKET;
export const s3Root = process.env.S3_ROOT;
