import 'dotenv/config';
const pkg = require("../../package.json");

export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const appPackageName = pkg.name;
export const appVersion = pkg.version;
export const appName = `${appPackageName}@${appVersion}`;

export const providerUrl = process.env.PROVIDER_URL;
export const arangoUrl = process.env.ARANGO_URL || "http://127.0.0.1:8529";
export const arangoDatabase = process.env.ARANGO_DATABASE;
export const arangoUsername = process.env.ARANGO_USERNAME;
export const arangoPassword = process.env.ARANGO_PASSWORD;

export default {
  pollInterval: 500,
  confirmations: 1,
  chunkSize: 10000,
  backoff: 1000
};
