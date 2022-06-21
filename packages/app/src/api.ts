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

export const captcha = (authToken?: string) => {
	let headers = {};
	if (authToken) {
		headers = {
			Authorization: `Bearer ${authToken}`
		};
	}

	return {
		post: (token: string): Promise<{ success: boolean }> => {
			return request
				.post("captcha", {
					headers,
					json: {
						token
					}
				})
				.json();
		},
		get: (id: string): Promise<{ success: boolean }> =>
			request.get(`captcha?id=${id}`, { headers }).json()
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
