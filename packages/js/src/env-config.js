export const isProd = process.env.NODE_ENV === "production";

export const apiUrl = process.env.API_URL;
export const satelliteUrl = process.env.SATELLITE_URL;

if (!process.env.API_URL) {
	/* eslint-disable no-console */
	console.log(`[USHER] WARNING: No API Url loaded!`);
}
if (!process.env.SATELLITE_URL) {
	/* eslint-disable no-console */
	console.log(`[USHER] WARNING: No Satellite Url loaded!`);
}
