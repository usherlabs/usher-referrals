import axios from "axios";
import axiosRetry from "axios-retry";
import { Base64 } from "js-base64";
import { supabase } from "@/utils/supabase-client";

export const getRequest = ({ headers = {} } = {}) => {
	const request = axios.create({
		baseURL: "/api",
		headers
	});

	axiosRetry(request, { retries: 3 });

	return request;
};

const getAuthReqeust = async ({ headers = {} } = {}) => {
	const session = await supabase.auth.session();

	if (session) {
		const { user, ...sessionData } = session;
		const token = Base64.encode(JSON.stringify(sessionData));
		headers.Authorization = `Bearer ${token}`;
	}

	return getRequest({ headers });
};

export default getAuthReqeust;
