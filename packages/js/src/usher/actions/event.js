/**
 * The Event action that triggers a conversion tracking
 *
 * 1. Use the API_URL from the Env
 * 2. Fetch usher affiliate conversion id from the cookie
 * 3. Post the id and event to the api
 */

import ky from "ky";
import cookies from "js-cookie";
import { apiUrl } from "@/env-config";

const request = ky.create({ prefixUrl: apiUrl });

const action = async ({ id, nativeId, properties } = {}) => {
	const convId = cookies.get("usher_cid");
	cookies.remove("usher_cid");
	if (!convId) {
		return;
	}

	await request.post("consume", {
		json: {
			convId,
			id,
			nativeId,
			properties
		}
	});
};

export default action;
