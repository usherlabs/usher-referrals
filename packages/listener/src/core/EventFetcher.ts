import { ethers } from "ethers";
import { log } from "../utils/logger";
import { ContractEvent } from "./ContractEvent";
import { Objective } from "./Objective";

export class EventFetcher {
	private provider: ethers.providers.BaseProvider;

	private objectives: Objective[] = [];

	constructor(
		provider: ethers.providers.BaseProvider,
		objectives: Objective[]
	) {
		this.provider = provider;
		this.objectives = objectives;
	}

	async getEvents(
		fromBlock: number,
		toBlock: number
	): Promise<ContractEvent[]> {
		const result: ContractEvent[] = [];

		for (const objective of this.objectives) {
			// TODO: review await in a for loop
			// eslint-disable-next-line no-await-in-loop
			const logs = await this.provider.getLogs({
				fromBlock,
				toBlock,
				address: objective.contract,
				topics: [objective.topics]
			});

			for (const l of logs) {
				// TODO: review await in a for loop
				// eslint-disable-next-line no-await-in-loop
				const tx = await this.provider.getTransaction(l.transactionHash);
				const event: ContractEvent = {
					contractAddress: objective.contract,
					walletAddress: tx.from.toLowerCase(),
					contractEvent: objective.eventByTopic(l.topics[0]),
					transaction: l.transactionHash
				};
				result.push(event);
			}
		}

		log.info(
			{
				fromBlock,
				toBlock,
				events: result
			},
			"Get Events"
		);

		return result;
	}
}
