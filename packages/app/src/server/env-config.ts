export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl =
	process.env.PUBLIC_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY;

export const botdSecretKey = process.env.BOTD_SECRET_KEY;

export const magicSecretKey = process.env.MAGIC_SECRET_KEY;

export const arangoUrl = process.env.ARANGO_URL || "http://127.0.0.1:8529";
export const arangoDatabase = process.env.ARANGO_DATABASE;
export const arangoUsername = process.env.ARANGO_USERNAME;
export const arangoPassword = process.env.ARANGO_PASSWORD;

export const humanodeClientId = process.env.HUMANODE_CLIENT_ID;
export const humanodeClientSecret = process.env.HUMANODE_CLIENT_SECRET;

export const didKey = process.env.DID_KEY;
