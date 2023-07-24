import { useRouteHandler } from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { AuthApiRequest } from "@/types";
import { getArangoClient } from "@/utils/arango-client";
import { aql } from "arangojs";
import { isEmpty } from "lodash";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler<AuthApiRequest>();
const arango = getArangoClient();

handler.router
	.use(withAuth)
	/**
	 * GET: Referral data for a given Campaign ID related to the authenticated DIDs
	 */
	.get(async (req, res) => {
		const { chain, id, limit, offset } = req.query;

		const pagination = {
			limit: parseInt(limit as string, 10) || 10,
			offset: parseInt(offset as string, 10) || 0
		};

		const campaignId = [chain, id].join(":");

		try {
			const cursor = await arango.query(aql`
				LET dids = ${req.user.map(({ did }) => `Dids/${did}`)}
				LET campaign_id = CONCAT("Campaigns/", ${campaignId})
				LET relatedDids = (
						FOR did in dids
								FOR related IN 1..1 ANY did Related
										COLLECT _id = related._id
										RETURN _id)
				LET uniquedDids = UNION_DISTINCT(dids, relatedDids)
				LET partnerships = (
						FOR did IN uniquedDids
								FOR partnership IN 1..1 OUTBOUND did Engagements
										FILTER STARTS_WITH(partnership._id, "Partnerships")
										FOR campaign IN 1..1 OUTBOUND partnership Engagements
												FILTER campaign._id == campaign_id
												RETURN partnership)
				FOR partnership IN partnerships
						FOR referral IN 1..1 OUTBOUND partnership Referrals
								SORT referral.converted_at
								LIMIT ${pagination.offset}, ${pagination.limit}
								RETURN KEEP(referral, "converted_at", "commit", "event_id", "native_id", "metadata")
			`);

			const results = (await cursor.all()).filter((result) => !isEmpty(result));

			return res.json({
				success: true,
				data: results
			});
		} catch (e) {
			req.log.error(e);
			return res.status(400).json({
				success: false
			});
		}
	});

export default handler.handle();
