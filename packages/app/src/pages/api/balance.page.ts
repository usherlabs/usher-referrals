import { z } from "zod";
import { Chains } from "@usher.so/shared";
import { useRouteHandler } from "@/server/middleware";
import { getArweaveClient } from "@/utils/arweave-client";
import { FEE_MULTIPLIER } from "@/constants";

// eslint-disable-next-line react-hooks/rules-of-hooks
const handler = useRouteHandler();

const schema = z.object({
	id: z.string(),
	chain: z.string()
});

const arweave = getArweaveClient();

handler.router.get(async (req, res) => {
	let { query } = req;
	try {
		query = await schema.parseAsync(query);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { id, chain } = query;

	if (chain === Chains.ARWEAVE) {
		let balance = await arweave.wallets.getBalance(id as string);
		// ----- This doesn't scale.
		if (
			["arweave:QOttOj5CmOJnzBHrqaCLImXJ9RwHVbMDY0QPEmcWptQ"]
				.map((cid) => cid.toLowerCase())
				.includes([chain, id].join(":").toLowerCase())
		) {
			balance = arweave.ar.arToWinston(`300`);
		}
		// -----
		const arBalance = arweave.ar.winstonToAr(balance);

		return res.json({
			success: true,
			balance: parseFloat(arBalance) * (1 - FEE_MULTIPLIER)
		});
	}

	return res.json({
		success: false,
		balance: 0
	});
});

export default handler.handle();
