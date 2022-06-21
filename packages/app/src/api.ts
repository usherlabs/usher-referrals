import ky from "ky";
import { Chains, Campaign } from "@/types";

// const formatQs = (o: Record<string, string>) => {
// 	const searchParams = new URLSearchParams(o);
// 	return searchParams.toString();
// };

export const request = ky.create({
	prefixUrl: "/api"
});

export const captcha = () => ({
	post: (token: string, id?: string[]): Promise<{ success: boolean }> =>
		request
			.post("captcha", {
				json: {
					token,
					id
				}
			})
			.json(),
	get: (id: string): Promise<{ success: boolean }> =>
		request.get(`captcha?id=${id}`).json()
});

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
		id?: string,
		chain?: Chains
	): Promise<{ success: boolean; data: Campaign[] }> => {
		const params = new URLSearchParams();
		if (id) {
			params.set("id", id);
		}
		if (chain) {
			params.set("chain", chain);
		}
		return request.get(`campaigns${params.toString()}`).json();
	}
});
