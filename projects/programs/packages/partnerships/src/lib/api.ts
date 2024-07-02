import { Api } from "@usher.so/shared";

import { CampaignReference, Partnership } from "./types.js";

export class PartnershipsApi extends Api {
	public relatedPartnerships(authToken: string) {
		const req = this.getAuthRequest(authToken);

		return {
			async get() {
				const resp = await req.get(`partnerships/related`).json();
				return resp as { success: boolean; data: Partnership[] };
			},
			async post(
				partnership: string,
				campaignRef: CampaignReference
			): Promise<{ success: boolean }> {
				return req
					.post(`partnerships/related`, {
						json: {
							partnership,
							campaignRef,
						},
					})
					.json();
			},
		};
	}
}
