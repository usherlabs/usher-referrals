/* eslint-disable no-console */

export const isProd = process.env.NODE_ENV === "production";
export const appPackageName = process.env.APP_NAME;
export const appVersion = process.env.APP_VERSION;
export const appName = `${appPackageName}@${appVersion}`;

export const apiUrl = process.env.API_URL;
