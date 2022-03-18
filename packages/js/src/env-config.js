export const isProd = process.env.NODE_ENV === "production";
console.log(process.env.NODE_ENV);

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
