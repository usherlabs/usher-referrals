import axios from "axios";
import axiosRetry from "axios-retry";
import { supabase } from "@/utils/supabase-client";

const getRequest = async () => {
	const session = await supabase.auth.session();

	const request = axios.create({
		baseURL: "/api",
		headers: {
			Authorization: `Bearer ${session.access_token}`
		}
	});

	axiosRetry(request, { retries: 3 });

	return request;
};

export default getRequest;
