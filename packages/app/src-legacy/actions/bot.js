import { request } from "@/utils/browser-request";

export const checkBotDetect = async (token) => {
	// Submit token to endpoint that requires auth
	const response = await request
		.post("bot", {
			json: {
				token
			}
		})
		.json();
	console.log(response);

	return response.success;
};

export const submitCaptcha = async (token) => {
	// Submit token to endpoint that requires auth
	const response = await request
		.post("captcha", {
			json: {
				token
			}
		})
		.json();
	console.log(response);

	return response.success;
};
