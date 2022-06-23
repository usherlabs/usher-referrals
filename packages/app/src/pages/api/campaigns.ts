import { aql } from "arangojs";
import { Base64 } from "js-base64";

import { ApiResponse, ApiRequest, CampaignReference } from "@/types";
import getHandler from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();
const arango = getArangoClient();

// Initializing the cors middleware
handler.get(async (req: ApiRequest, res: ApiResponse) => {
	const { q } = req.query;

	let keys: string[] = [];
	if (typeof q === "string") {
		try {
			const json = Base64.decode(q);
			const refs = JSON.parse(json) as CampaignReference[];
			keys = refs.map((ref) => `"${ref.chain}:${ref.address}"`);
		} catch (e) {
			return res.status(400).json({
				success: false,
				data: []
			});
		}
	}

	let query;
	if (keys.length > 0) {
		query = aql`
			RETURN DOCUMENT("Campaigns", ${keys.join(", ")})
		`;
	} else {
		query = aql`
			FOR c IN Campaigns
				RETURN c
		`;
	}
	const cursor = await arango.query(query);

	const campaigns = await cursor.all();

	const data = campaigns.map((campaign) =>
		Object.entries(campaign).reduce<typeof campaign>((acc, [key, value]) => {
			if (key.charAt(0) !== "_") {
				acc[key] = value;
			}
			return acc;
		}, {})
	);

	return res.json({
		success: true,
		data
	});
});

export default handler;
