import axios from "axios";
import axiosRetry from "axios-retry";
import { Base64 } from "js-base64";
import { supabase } from "@/utils/supabase-client";

const getRequest = async () => {
	const session = await supabase.auth.session();

	const headers = {};
	if (session) {
		const { user, ...sessionData } = session;
		const token = Base64.encode(JSON.stringify(sessionData));
		headers.Authorization = `Bearer ${token}`;
	}

	const request = axios.create({
		baseURL: "/api",
		headers
	});

	axiosRetry(request, { retries: 3 });

	return request;
};

export default getRequest;
