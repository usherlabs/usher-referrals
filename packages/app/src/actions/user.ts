import { request, getAuthRequest } from "@/utils/browser-request";
import { Profile } from "@/types";

export const checkCaptcha = async (): Promise<boolean> => {
	const req = await getAuthRequest();
	const response: { success: boolean } = await req.get("user/captcha").json();

	return response.success;
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

export const getProfile = async () => {
	const req = await getAuthRequest();
	const response: { success: boolean; profile: Profile } = await req
		.get("user/profile")
		.json();

	return response.profile;
};
