import { aql } from "arangojs";

import { ApiResponse, ApiRequest } from "@/types";
import getHandler from "@/server/middleware";
import getArangoClient from "@/utils/arango-client";

const handler = getHandler();
const arango = getArangoClient();

// Initializing the cors middleware
handler.get(async (req: ApiRequest, res: ApiResponse) => {
	const { chain, id } = req.query;

	const filter = [
		id ? `c.id == "${id}"` : true,
		chain ? `c.chain == "${chain}"` : true
	].join(" AND ");

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
