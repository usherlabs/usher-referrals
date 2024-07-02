import ky from "ky-universal";

import { Conversion, ConversionResponse } from "@/types";
import Token from "./token";
import Configure from "./configure";
import { appName } from "./env-config";

export const convert = async (
	conversion: Conversion
): Promise<ConversionResponse | null> => {
	console.log("[USHER]", conversion);

	const ref = {
		id: conversion.id,
		chain: conversion.chain
	};

	const token = Token.next(ref);

	if (!token) {
		console.error(`[USHER] No token received from a valid referral`);
		return null;
	}

	if (
		!conversion.id ||
		!conversion.chain ||
		typeof conversion.eventId !== "number"
	) {
		console.error(
			`[USHER] Campaign 'id', 'chain' and 'eventId' must be specified to track a conversion`
		);
		return null;
	}

	try {
		const request = ky.create({
			prefixUrl: Configure.getApiUrl(),
			headers: {
				client: appName
			}
		});

		// Start the conversion using the referral token
		// ? Here we fetch the Usher Network Signature verifying the referral
		const response: { success: boolean; data: { code: string } } = await request
			.get(
				`conversions?id=${conversion.id}&chain=${conversion.chain}&token=${token}`
			)
			.json();
		if (!response.success) {
			throw new Error(
				"Failed to convert start conversion using referral token"
			);
		}

		const { code } = response.data;

		// ? This code will eventually be replaced with syndication of data to the decentralised DPK validator network
		const saveResponse: {
			success: boolean;
			data: { conversion: string; partnership: string };
			message?: string;
		} = await request
			.post("conversions", {
				json: {
					code,
					...conversion
				}
			})
			.json();

		if (!saveResponse.success) {
			throw new Error(`Could not save conversion: ${saveResponse.message}`);
		}

		return saveResponse.data;
	} catch (e) {
		if (typeof window !== "undefined") {
			console.error(`[USHER]`, e);
		} else {
			throw e;
		}
	}

	return null;
};
