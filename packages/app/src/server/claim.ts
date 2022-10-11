import { PartnershipMetrics } from "@/types";
import { getArangoClient } from "@/utils/arango-client";
import { aql } from "arangojs";
import pino from "pino";

const arango = getArangoClient();

/**
 * Indexes Claim, Reduces Remaining Rewards for Partnership
 * @param partnershipsData
 * @param rewardsToPay
 * @param to
 * @param rewardTxId
 * @param fee
 * @param feeWallet
 * @param feeTxId
 * @param log
 */
export async function indexClaim(
	partnershipsData: ({ _key: string } & PartnershipMetrics)[],
	rewardsToPay: number,
	to: string,
	rewardTxId: string,
	fee: number,
	feeWallet: string,
	feeTxId: string,
	log: pino.Logger
) {
	let rewardsToDeductFrom = rewardsToPay;
	const rewardDeductions: [string, number][] = [];
	partnershipsData.forEach((p) => {
		if (rewardsToDeductFrom > 0) {
			const deduction = Math.min(p.rewards, rewardsToDeductFrom);
			rewardsToDeductFrom -= deduction;
			rewardDeductions.push([p._key, deduction]);
		}
	});
	log.debug(
		{ data: { rewardDeductions } },
		"Reward deductions applied to Partnerships"
	);

	const indexCursor = await arango.query(aql`
    LET ps = (
      FOR deduction IN ${rewardDeductions}
        LET partnership = DOCUMENT("Partnerships", deduction[0])
        LET newRewards = MAX([partnership.rewards - deduction[1], 0])
        RETURN MERGE(
            partnership,
            {
                rewards: newRewards
            }
        )
    )
    INSERT {
      amount: ${rewardsToPay},
      to: ${to},
      fee: ${fee},
      feeWallet: ${feeWallet},
      txs: {
        reward: ${rewardTxId},
        fee: ${feeTxId}
      },
      created_at: ${Date.now()}
    } INTO Claims
    LET c = NEW
    LET e = (
      FOR p IN ps
        UPDATE { _key: p._key } WITH { rewards: p.rewards } IN Partnerships
        INSERT {
          _from: p._id,
          _to: c._id
        } INTO Engagements
        RETURN NEW
    )
    RETURN {
      claim: c,
      partnerships: ps,
      edges: e
    }
  `);
	const indexResults = await indexCursor.all();

	log.info({ data: { indexResults } }, "Claim indexed");
}
