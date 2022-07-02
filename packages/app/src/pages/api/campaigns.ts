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

	let source = aql`Campaigns`;
	if (keys.length > 0) {
		source = aql`DOCUMENT("Campaigns", ${keys})`;
	}
	const cursor = await arango.query(aql`
		FOR c IN ${source}
			LET rewards_claimed = (
				FOR cl IN 1..1 INBOUND c Verifications
					FILTER STARTS_WITH(cl._id, "Claims")
					COLLECT AGGREGATE amount = SUM(cl.amount)
					RETURN amount
			)
			LET campaign = KEEP(c, ATTRIBUTES(c, true))
			RETURN MERGE(
					campaign,
					{
							rewards_claimed: TO_NUMBER(rewards_claimed[0])
					}
			)
	`);

	const campaigns = camelcaseKeys(
		(await cursor.all()).filter((result) => !isEmpty(result)),
		{ deep: true }
	);

	req.log.debug({ campaigns }, "campaigns result");

	return res.json({
		success: true,
		data: campaigns
	});
});

export default handler;
