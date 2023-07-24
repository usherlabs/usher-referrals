import { aql } from "arangojs";

import { PartnershipMetrics } from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getArangoClient } from "@/utils/arango-client";

// eslint-disable-next-line react-hooks/rules-of-hooks
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
			LET claimed = (
				FOR claim IN 1..3 ANY p Engagements
						FILTER STARTS_WITH(claim._id, "Claims")
						COLLECT AGGREGATE amount = SUM(claim.amount)
								RETURN amount
			)
			LET last_claimed_at = (
				FOR claim IN 1..1 ANY p Engagements
						FILTER STARTS_WITH(claim._id, "Claims")
						COLLECT AGGREGATE last_claimed_at = MAX(claim.created_at)
								RETURN last_claimed_at
			)
			RETURN {
				id: p._key,
				hits: p.hits,
				pending_conversions: 0,
				successful_conversions: TO_NUMBER(conversions_length),
				rewards: TO_NUMBER(p.rewards),
				rewards_claimed: TO_NUMBER(claimed),
				last_claimed_at: last_claimed_at
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
			acc.lastClaimedAt = Math.max(acc.lastClaimedAt, val.last_claimed_at);
			acc.campaign.claimed += val.rewards_claimed;
			return acc;
		},
		{
			partnerships: [],
			hits: 0,
			conversions: {
				pending: 0,
				successful: 0
			},
			rewards: 0,
			lastClaimedAt: 0,
			campaign: {
				claimed: 0
			}
		}
	);

	req.log.info({ data }, "Partnership metrics fetched");

	return res.json({
		success: true,
		data
	});
});

export default handler.handle();
