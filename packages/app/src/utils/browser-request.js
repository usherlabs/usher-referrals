import ky from "ky";
import { Base64 } from "js-base64";
import { supabase } from "@/utils/supabase-client";

export const request = ky.create({
	prefixUrl: "/api"
});

export const getAuthRequest = async ({ headers = {} } = {}) => {
	const session = await supabase.auth.session();

	if (session) {
		const { user, ...sessionData } = session;
		const token = Base64.encode(JSON.stringify(sessionData));
		headers.Authorization = `Bearer ${token}`;
	}

	return request.extend({
		headers
	});
};
