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

	let filter = "true";
	if (typeof q === "string") {
		const json = Base64.decode(q);
		const refs = JSON.parse(json) as CampaignReference[];
		filter = refs
			.map((ref) =>
				[`c.id == "${ref.address}"`, `c.chain == "${ref.chain}"`].join(" AND ")
			)
			.map((f) => `(${f})`)
			.join(" OR ");
	}

	const cursor = await arango.query(aql`
		FOR c IN Campaigns
			FILTER ${filter}
			RETURN c
	`);

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
