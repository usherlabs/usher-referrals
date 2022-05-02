import { ApiError } from "@supabase/supabase-js";
import ono from "@jsdevtools/ono";
import { User } from "@/types";
import { supabase } from "@/utils/supabase-client";
import { request, getAuthRequest } from "@/utils/browser-request";

export const checkCaptcha = async (user: User): Promise<boolean> => {
	// Check if the user has completed a captcha previously
	//* This check subject to change depending on how rigorous bot prevention at auth becomes.
	const sSel = await supabase
		.from("user_captcha_log_entries")
		.select(`id`, { count: "exact", head: true })
		.match({ is_success: true, user_id: user.id })
		.order("created_at", { ascending: false })
		.limit(1);
	if (sSel.error && sSel.status !== 406) {
		throw ono(sSel.error, "user_captcha_log_entries");
	}
	console.log("user_captcha_log_entries: select", sSel);

	if ((sSel.count as number) > 0) {
		return true;
	}

	return false;
};

export const submitCaptcha = async (token: string): Promise<boolean> => {
	// Submit token to endpoint that requires auth
	const req = await getAuthRequest();
	const response: { success: boolean } = await req
		.post("user/captcha", {
			json: {
				token
			}
		})
		.json();
	console.log(response);

	return response.success;
};

export const authorise = async ({
	email,
	wallet
}: {
	email: string;
	wallet: string;
}): Promise<{ success: boolean }> => {
	const response: { success: boolean } = await request
		.post("auth", {
			json: {
				email,
				wallet
			}
		})
		.json();
	console.log(response);

	return response;
};
