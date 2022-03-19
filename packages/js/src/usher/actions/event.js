/**
 * The Event action that triggers a conversion tracking
 *
 * 1. Use the API_URL from the Env
 * 2. Fetch usher affiliate conversion id from the satellite
 * 3. Post the id and event to the api
 */

import ky from "ky";
import { apiUrl } from "@/env-config";
import bus from "@/utils/bus";
import Satellite from "@/utils/satellite";

const request = ky.create({ prefixUrl: apiUrl });

const action = async ({ id, nativeId, properties } = {}) => {
	if (!Satellite.isLoaded) {
		await Satellite.load();
	}

	// Received the cid (Conversion ID)
	bus.on("cid", async ({ cid }) => {
		if (!cid) {
			return;
		}

		// console.log("consuming");
		// const resp =
		await request
			.post("consume", {
				json: {
					cid,
					id,
					nativeId,
					properties
				}
			})
			.json();

		// console.log(resp);
		bus.emit("consume");
	});
	bus.emit("ping");
};

export default action;
