import { request } from "@/utils/browser-request";

export const submitBotDetect = async (token: string): Promise<boolean> => {
	// Submit token to endpoint that requires auth
	const response: { success: boolean } = await request
		.post("bot", {
			json: {
				token
			}
		})
		.json();
	console.log(response);

	return response.success;
};

export const checkCaptcha = async (id: string): Promise<boolean> => {
	const response: { success: boolean } = await request
		.get(`captcha?id=${id}`)
		.json();

	return response.success;
};

export const submitCaptcha = async (
	id: string,
	token: string
): Promise<boolean> => {
	// Submit token to endpoint that requires auth
	const response: { success: boolean } = await request
		.post("captcha", {
			json: {
				id,
				token
			}
		})
		.json();
	console.log(response);

	return response.success;
};
