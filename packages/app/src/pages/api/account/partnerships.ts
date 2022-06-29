/**
 * POST: Register partnership against DID
 */

import { z } from "zod";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";

import { ApiResponse, AuthApiRequest, CampaignReference } from "@/types";
import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";

const handler = getHandler();

const schema = z.object({
	id: z.string()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

handler.use(withAuth).post(async (req: AuthApiRequest, res: ApiResponse) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { id } = body;

	const stream = await loader.load(id);

	const campaignRef = stream.content as CampaignReference;

	const dids = req.user.map(({ did }) => did);

	// Check if partnership exists
	const checkCursor = await arango.query(aql`
		RETURN DOCUMENT("Partnerships", ${id})
	`);
	const checkResults = await checkCursor.all();
	if (checkResults.length > 0) {
		req.log.info({ id, results: checkResults }, "Partnership already exists");
		return res.json({
			success: true
		});
	}

	const cursor = await arango.query(aql`
		INSERT {
			_key: ${id},
			rewards: 0
		} INTO Partnerships
		LET p = NEW
		INSERT {
			_from: p._id,
			_to: ${`Campaigns/${[campaignRef.chain, campaignRef.address].join(":")}`}
		} INTO Engagements
		LET pe = NEW
		LET
	`);

	return res.json({
		success: false // assume all visitors are bots
	});
});

export default handler;
