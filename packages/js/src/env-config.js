export const isProd = process.env.NODE_ENV === "production";

export const apiUrl = process.env.API_URL;

if (!apiUrl) {
	/* eslint-disable no-console */
	console.error(`No API Url loaded!`);
}
