import { useEffect } from "react";
import Framebus from "framebus";
import { parseCookies, destroyCookie } from "nookies";
import { Sha256 } from "@aws-crypto/sha256-js";
import cuid from "cuid";
import { fromString } from "uint8arrays";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { Base64 } from "js-base64";
import { randomString } from "@stablelib/random";

import { getAuthRequest } from "@/api";
import { CONVERSION_COOKIE_NAME } from "@/constants";
import { ConversionTrack } from "@/types";
import handleException from "@/utils/handle-exception";
import ono from "@jsdevtools/ono";

const bus = new Framebus({
	channel: "usher_sat"
});

const Satellite = () => {
	useEffect(() => {
		const cookies = parseCookies();
		console.log("SATELLITE:", cookies); //! DEV

		bus.on("convert", async (busParams) => {
			try {
				const conversion = busParams as ConversionTrack;

				console.log("[SATELLITE]", conversion);

				const token = cookies[CONVERSION_COOKIE_NAME] || "";
				// let visitorId;

				if (!token) {
					console.log(`[USHER] No token received from a valid referral`);
					return;
				}
				if (
					!conversion.id ||
					!conversion.chain ||
					typeof conversion.eventId !== "number"
				) {
					console.log(
						`[USHER] Campaign 'id', 'chain' and 'eventId' must be specified to track a conversion`
					);
					return;
				}

				// Authenticate a DID
				// let entropy = new Uint8Array();
				// if (visitorId) {
				// 	const hash = new Sha256();
				// 	hash.update(visitorId);
				// 	entropy = await hash.digest();
				// } else {
				// }
				const entropy = fromString([cuid(), randomString(6)].join("_"));

				const did = new DID({
					// Get the DID provider from the 3ID Connect instance
					provider: new Ed25519Provider(entropy),
					resolver: getKeyResolver()
				});
				await did.authenticate();

				// Produce the DID Auth Token
				const nonce = randomString(32);
				const sig = await did.createJWS(nonce, { did: did.id });
				const raw = [[did.id, sig]];
				const authToken = Base64.encode(JSON.stringify(raw));

				const request = getAuthRequest(authToken);

				// Start the conversion using the referral token
				const response: { success: boolean; data: { code: string } } =
					await request
						.get(
							`conversions?id=${conversion.id}&chain=${conversion.chain}&token=${token}`
						)
						.json();
				if (!response.success) {
					console.log(
						`Failed to convert start conversion using referral token`
					);
					throw ono(
						"[SATELLITE] Failed to convert start conversion using referral token"
					);
				}

				const { code } = response.data;

				// This part will eventually be replaced with a syndication of data to the decentralised DPK network
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
					console.log(
						`[USHER] Could not save conversion: ${saveResponse.message || ""}`
					);
					throw ono(`[SATELLITE] Could not save conversion`, saveResponse);
				}

				// Destroy the cookie on success
				destroyCookie(null, CONVERSION_COOKIE_NAME);

				// Notify the host
				bus.emit("conversion", {
					conversion,
					did: did.id,
					response: saveResponse.data
				});
			} catch (e) {
				handleException(e);
			}
		});

		bus.emit("loaded");
	}, []);

	return null;
};

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default Satellite;
