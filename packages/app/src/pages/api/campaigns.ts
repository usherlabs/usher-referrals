import { aql } from "arangojs";
import isEmpty from "lodash/isEmpty";
import camelcaseKeys from "camelcase-keys";

import { ApiResponse, ApiRequest } from "@/types";
import getHandler from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();
const arango = getArangoClient();

// Initializing the cors middleware
handler.get(async (req: ApiRequest, res: ApiResponse) => {
	const { q } = req.query;

	let keys: string[] = [];
	if (typeof q === "string") {
		keys = q.split(","); // array of chain:address
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

	let campaigns = [];
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
	campaigns = camelcaseKeys(campaigns, { deep: true });

	req.log.debug({ campaigns }, "campaigns result");

	return res.json({
		success: true,
		data: campaigns
	});
});

export default handler;
