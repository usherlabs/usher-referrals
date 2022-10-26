import { aql } from "arangojs";
import { Campaign } from "./types";
import { getArangoClient } from "./utils/arango-client";
import { log } from "./utils/logger";

const arango = getArangoClient();

/**
 * Check if a Conversion already created for the Event emitted by the Transaction
 * @param transaction Transaction hash
 * @returns true if the transaction already converted
 */
async function isTransactionConverted(transaction: string): Promise<boolean> {
	const cursor = await arango.query(aql`
      FOR conversion IN Conversions
        FILTER conversion.transaction == ${transaction}
        RETURN true
    `);
	const result = await cursor.all();

	return result.length !== 0;
}

/**
 * Creates a Conversion and updates the Partnership's reward amount
 * @param partnershipId Partnership Id
 * @param eventId Event Id
 * @param reward Reward
 * @param transaction Transaction hash
 */
async function createConversion(
	partnershipId: string,
	eventId: number,
	reward: number,
	transaction: string
) {
	log.info(
		{
			partnershipId,
			eventId,
			reward,
			transaction
		},
		"Creating conversion..."
	);

	await arango.query(aql`
    LET partnership = DOCUMENT("Partnerships", ${partnershipId})
    INSERT {
      partnership: ${partnershipId},
      event_id: ${eventId},
      created_at: ${Date.now()},
      converted_at: ${Date.now()},
      transaction: ${transaction}
    } INTO Conversions OPTIONS { waitForSync: true }
    LET conversion = NEW
    INSERT {
      _from: partnership._id,
      _to: conversion._id
    } INTO Referrals OPTIONS { waitForSync: true }
    UPDATE partnership WITH {
      rewards: SUM([partnership.rewards, ${reward}])
    } IN Partnerships OPTIONS { waitForSync: true }
  `);
}

export async function convert(
	campaign: Campaign,
	eventId: number,
	partnershipId: string,
	transaction: string
) {
	const event = campaign.events[eventId];

	// TODO: A lot of logic to determine the reward that implemented for a web conversion has been ommited here. Need to review.
	const { rate } = event;
	const reward = rate;

	if (await isTransactionConverted(transaction)) {
		log.info(
			{
				campaign,
				eventId,
				transaction
			},
			"Event already converted"
		);
		return;
	}

	// // TODO: Include a process to check remaining rewards -- to determine the rewards to set
	// // Should reflect how the validator nodes should validate conversions.
	// // TODO: Do this inside of a "basis" validator node -- this will speed up the operation of this function too.
	// ? We shouldn't be allocating rewards with the limit in consideration
	// ? Instead, you can earn as many limitless rewards, but may only withdraw up to a limit.

	await createConversion(partnershipId, eventId, reward, transaction);
}
