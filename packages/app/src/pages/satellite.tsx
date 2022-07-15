/* eslint-disable */

import { useEffect } from "react";
import Framebus from "framebus";
import cuid from "cuid";
import { fromString } from "uint8arrays";
import { DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { Base64 } from "js-base64";
import { randomString } from "@stablelib/random";
// import lscache from "lscache";
// import { createRouter } from "next-connect";
// import cors from "cors";
// import localforage from "localforage";
import { useRouter } from "next/router";
import useLocalStorage from "use-local-storage";

import { getAuthRequest } from "@/api";
import { ConversionTrack } from "@/types";
import handleException from "@/utils/handle-exception";
import ono from "@jsdevtools/ono";
import getReferralTokenKey from "@/utils/get-referral-token-key";
// import { GetServerSideProps } from "next";

const bus = new Framebus({
	channel: "usher_sat"
});

const startSatellite = () => {
	if (typeof window !== "undefined") {
		console.log(
			"[SATELLITE]",
			Object.keys(window.localStorage).map((key) => ({
				key,
				value: window.localStorage.getItem(key)
			}))
		);
	}
	// lscache.flushExpired();

	bus.on("convert", async (busParams) => {
		try {
			const conversion = busParams as ConversionTrack;

			console.log("[SATELLITE]", conversion);

			const tokenKey = getReferralTokenKey(conversion.id, conversion.chain);

			// const token = lscache.get(tokenKey);
			const token = window.localStorage.getItem(tokenKey);
			// let visitorId;

			if (!token) {
				console.error(`[USHER] No token received from a valid referral`);
				return;
			}
			if (
				!conversion.id ||
				!conversion.chain ||
				typeof conversion.eventId !== "number"
			) {
				console.error(
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
				console.error(
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
				console.error(
					`[USHER] Could not save conversion: ${saveResponse.message || ""}`
				);
				throw ono(`[SATELLITE] Could not save conversion`, saveResponse);
			}

			// Destroy the key on success
			// lscache.remove(tokenKey);

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
};

const Satellite = () => {
	const [, setSomeState] = useLocalStorage<string>("__some_arb_state", "");
	const router = useRouter();
	const { p } = router.query;

	useEffect(() => {
		// startSatellite();
		if (p) {
			setSomeState(p as string);
		}
	}, [p]);

	return null;
};

// const router = createRouter()
// 	.use(cors())
// 	.get(() => {
// 		return {
// 			noUser: true
// 		};
// 	});

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
// 	const props = await router.run(req, res);
// 	return { props: props as { [key: string]: any } };
// };

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default Satellite;
