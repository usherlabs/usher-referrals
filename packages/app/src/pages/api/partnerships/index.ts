import { aql } from "arangojs";

import { PartnershipMetrics } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";

const handler = useRouteHandler();
const arango = getArangoClient();

/**
 * GET: Partnerships and related metrics using a query
 */
handler.router.get(async (req, res) => {
	const { q } = req.query;

	if (typeof q === "undefined") {
		return res.status(400).json({
			success: false,
			message: `Query paramter 'q' must be defined`
		});
	}

	let ids: string[] = [];
	if (typeof q === "string") {
		ids = q.split(",");
	}

	req.log.info({ ids }, "Get partnerships for ids");

	const cursor = await arango.query(aql`
		FOR p IN DOCUMENT("Partnerships", ${ids})
			LET referrals = (
				FOR c IN 1..1 OUTBOUND p Referrals
				RETURN c
			)
			LET conversions_length = (
				FOR r IN referrals
					FILTER r.event_id != null
						COLLECT WITH COUNT INTO length
						RETURN length
			)
			RETURN {
				id: p._key,
				hits: p.hits,
				pending_conversions: 0,
				successful_conversions: TO_NUMBER(conversions_length),
				rewards: TO_NUMBER(p.rewards)
			}
	`);

	const results = await cursor.all();

	const data = results.reduce<PartnershipMetrics>(
		(acc, val) => {
			acc.partnerships.push(val.id);
			acc.hits += val.hits;
			acc.conversions.pending += val.pending_conversions;
			acc.conversions.successful += val.successful_conversions;
			acc.rewards += val.rewards;

			return acc;
		},
		{
			partnerships: [],
			hits: 0,
			conversions: {
				pending: 0,
				successful: 0
			},
			rewards: 0
		}
	);

	req.log.info({ data }, "Partnership metrics fetched");

	return res.json({
		success: true,
		data
	});
});

export default handler.handle();
