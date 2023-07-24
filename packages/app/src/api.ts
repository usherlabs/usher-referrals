import { Chains, Connections } from "@usher.so/shared";
import camelcaseKeys from "camelcase-keys";
import ky from "ky";

import { LinkConnection, LinkStats } from "@/programs/collections/types";
import { Claim, PartnershipMetrics, Profile, Referral } from "@/types";

// const formatQs = (o: Record<string, string>) => {
// 	const searchParams = new URLSearchParams(o);
// 	return searchParams.toString();
// };

export const request = ky.create({
	prefixUrl: "/api"
});

export const getAuthRequest = (authToken: string): typeof request =>
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
		wallet?: string,
		connection?: Connections
	): Promise<{ success: boolean; data?: Referral }> => {
		return request
			.post(`referrals`, {
				json: {
					partnership,
					wallet,
					connection
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

export const hits = () => {
	return {
		post: (id: string): Promise<{ success: boolean }> => {
			return request.post(`collections/${id}/hits`, { json: { id } }).json();
		}
	};
};

export const redirects = () => {
	return {
		post: (
			linkId: string,
			chain: Chains,
			address: string,
			connection: Connections
		): Promise<{ success: boolean }> => {
			return request
				.post(`collections/${linkId}/redirects`, {
					json: { chain, address, connection }
				})
				.json();
		}
	};
};

export const collections = (authToken: string) => {
	const req = getAuthRequest(authToken);
	return {
		get: (): Promise<{ success: boolean; data: LinkStats[] }> => {
			return req.get(`collections`).json();
		},
		getById: async (
			id: string
		): Promise<{ success: boolean; data: LinkConnection[] }> => {
			const json = await req.get(`collections/${id}`).json<{
				success: boolean;
				data: LinkConnection[];
			}>();
			return camelcaseKeys(json, { deep: true }) as {
				success: boolean;
				data: LinkConnection[];
			};
		},
		post: async (id: string): Promise<{ success: boolean }> => {
			return req.post(`collections`, { json: { linkId: id } }).json();
		}
	};
};

export const balance = () => {
	return {
		get: (
			id: string,
			chain: string
		): Promise<{ succss: boolean; balance: number }> => {
			return request.get(`balance?id=${id}&chain=${chain}`).json();
		}
	};
};
