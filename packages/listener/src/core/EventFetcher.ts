import { ethers } from "ethers";
import { ContractEvent } from "./ContractEvent";
import { Objective } from "./Objective";

export class EventFetcher {
  private provider: ethers.providers.BaseProvider;
  private objectives: Objective[] = [];

  constructor(provider: ethers.providers.BaseProvider, objectives: Objective[]) {
    this.provider = provider;
    this.objectives = objectives;
  }

  async getEvents(fromBlock: number, toBlock: number): Promise<ContractEvent[]> {
    const result: ContractEvent[] = [];

    for (const objective of this.objectives) {
      const logs = await this.provider.getLogs({
        fromBlock,
        toBlock,
        address: objective.contract,
        topics: [objective.topics]
      });

      for (const log of logs) {
        const tx = await this.provider.getTransaction(log.transactionHash);
        const event: ContractEvent = {
          contractAddress: objective.contract,
          walletAddress: tx.from.toLowerCase(),
          contractEvent: objective.eventByTopic(log.topics[0]),
          transaction: log.transactionHash
        }
        result.push(event);
      }
    }

    return result;
  }
}
