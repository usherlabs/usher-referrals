import ky from "ky";
import { Base64 } from "js-base64";
import { CampaignReference, Campaign } from "@/types";

// const formatQs = (o: Record<string, string>) => {
// 	const searchParams = new URLSearchParams(o);
// 	return searchParams.toString();
// };

export const request = ky.create({
	prefixUrl: "/api"
});

export const getAuthRequest = (authToken: string) =>
	request.extend({
		headers: {
			Authorization: `Bearer ${authToken}`
		}
	});

export const captcha = (authToken?: string) => {
	let req = request;
	if (authToken) {
		req = getAuthRequest(authToken);
	}

	return {
		post: (token: string): Promise<{ success: boolean }> => {
			return req
				.post(`${authToken ? "verify/" : ""}captcha`, {
					json: {
						token
					}
				})
				.json();
		},
		get: (): Promise<{ success: boolean }> => req.get(`verify/captcha`).json()
	};
};

export const personhood = (authToken: string) => {
	const req = getAuthRequest(authToken);

	return {
		post: (token: string): Promise<{ success: boolean }> => {
			return req
				.post("verify/personhood", {
					json: {
						token
					}
				})
				.json();
		},
		get: (): Promise<{ success: boolean }> =>
			req.get(`verify/personhood`).json()
	};
};

export const bot = () => ({
	post: (requestId: string): Promise<{ success: boolean }> =>
		request
			.post("bot", {
				json: {
					requestId
				}
			})
			.json()
});

export const campaigns = () => ({
	get: (
		references?: CampaignReference[]
	): Promise<{ success: boolean; data: Campaign[] }> => {
		let qs = "";
		if (references && references.length > 0) {
			const params = new URLSearchParams();
			const q = Base64.encodeURI(JSON.stringify(references));
			params.set("q", q);
			qs = params.toString();
		}
		return request.get(`campaigns${qs}`).json();
	}
});
