import ky from "ky";

import { Claim, PartnershipMetrics, Profile, Referral } from "@/types";
import { Link, LinkHit } from "./components/Collection/types";

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
					},
					timeout: 60000
				})
				.json();
		},
		get: (): Promise<{ success: boolean }> =>
			req.get(`verify/captcha`, { timeout: 30000 }).json()
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
					},
					timeout: 60000
				})
				.json();
		},
		get: (): Promise<{ success: boolean }> =>
			req.get(`verify/personhood`, { timeout: 30000 }).json()
	};
};

export const bot = () => ({
	post: (token: string): Promise<{ success: boolean }> =>
		request
			.post("bot", {
				json: {
					token
				}
			})
			.json()
});

export const partnerships = () => ({
	get: (
		ids: string | string[]
	): Promise<{ success: boolean; data: PartnershipMetrics }> => {
		let qs = "";
		if (!Array.isArray(ids)) {
			ids = [ids];
		}
		if (ids.length > 0) {
			const params = new URLSearchParams();
			const q = ids.join(",");
			params.set("q", q);
			qs = `?${params.toString()}`;
		}
		return request.get(`partnerships${qs}`).json();
	}
});

export const referrals = () => ({
	post: (
		partnership: string,
		wallet?: string
	): Promise<{ success: boolean; data?: Referral }> => {
		return request
			.post(`referrals`, {
				json: {
					partnership,
					wallet
				}
			})
			.json();
	}
});

export const claim = (authToken: string) => {
	const req = getAuthRequest(authToken);

	return {
		post(
			partnership: string | string[],
			to: string
		): Promise<{
			success: boolean;
			data?: Claim;
		}> {
			return req
				.post("claim", {
					// TODO: Temporary workaround. Needs a better solution
					timeout: 5 * 60 * 1000, // 5 minutes
					json: {
						partnership,
						to
					}
				})
				.json();
		}
	};
};

export const profile = (authToken: string) => {
	const req = getAuthRequest(authToken);

	return {
		post(p: Profile): Promise<{ success: boolean; profile: Profile }> {
			return req
				.post("profile", {
					json: p
				})
				.json();
		},
		get(): Promise<{ success: boolean; profile: Profile }> {
			return req.get("profile", { timeout: 30000 }).json();
		}
	};
};

export const collections = () => {
	// const req = getAuthRequest(authToken);
	return {
		get: (): Promise<{ success: boolean; data: Link[] }> => {
			return request.get(`collections`).json();
		},
		getById: (id: string): Promise<{ success: boolean; data: Link[] }> => {
			return request.get(`collections/${id}`).json();
		},
		getHits: (id: string): Promise<{ success: boolean; data: LinkHit[] }> => {
			return request.get(`collections/${id}/hits`).json();
		}
	};
};
