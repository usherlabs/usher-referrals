import { CampaignReference } from "@usher.so/partnerships";
import { Api } from "@usher.so/shared";

import { Campaign } from "./types.js";

export class CampaignsApi extends Api {
	public campaigns() {
		const req = this.getRequest();

		return {
			async get(
				references?: CampaignReference | CampaignReference[]
			): Promise<{ success: boolean; data: Campaign[] }> {
				let qs = "";
				if (references) {
					if (!Array.isArray(references)) {
						references = [references];
					}
					if (references.length > 0) {
						const params = new URLSearchParams();
						const q = references
							.map((ref) => [ref.chain, ref.address].join(":"))
							.join(",");
						params.set("q", q);
						qs = `?${params.toString()}`;
					}
				}
				return req.get(`campaigns${qs}`).json();
			},
			async index(
				id: string
			): Promise<{ success: boolean; campaign: Campaign }> {
				const response: {
					success: boolean;
					campaign: Campaign;
				} = await req.get(`campaigns/${id}/`).json();
				return response;
			},
		};
	}
}
