import { aql } from "arangojs";
import { Base64 } from "js-base64";
import isEmpty from "lodash/isEmpty";

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
			console.log("refs", refs);
			keys = refs.map((ref) => `${ref.chain}:${ref.address}`);
		} catch (e) {
			return res.status(400).json({
				success: false,
				data: []
			});
		}
	}

	req.log.info({ keys }, "Get campaigns for keys");

	let query;
	if (keys.length > 0) {
		query = aql`
			FOR c IN DOCUMENT("Campaigns", ${keys})
				RETURN c
		`;
	} else {
		query = aql`
			FOR c IN Campaigns
				RETURN c
		`;
	}
	const cursor = await arango.query(query);

	const campaigns = [];
	for await (const result of cursor) {
		if (result !== null && !isEmpty(result)) {
			const campaign = Object.entries(result).reduce<typeof result>(
				(acc, [key, value]) => {
					if (key.charAt(0) !== "_") {
						acc[key] = value;
					}
					return acc;
				},
				{}
			);
			campaigns.push(campaign);
		}
	}

	req.log.debug({ campaigns }, "campaigns result");

	return res.json({
		success: true,
		data: campaigns
	});
});

export default handler;
