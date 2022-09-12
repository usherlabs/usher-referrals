import { aql } from "arangojs";
import { BlockPolling } from "./core/BlockPolling";
import { ContractEvent } from "./core/ContractEvent";
import { EventFetcher } from "./core/EventFetcher";
import { EventListener } from "./core/EventListener";
import { Objective } from "./core/Objective";
import { getArangoClient } from "./utils/arango-client";
import { getJsonRpcProvider } from "./utils/json-rpc-provider";

async function loadCampaigns() {
  console.log("Loading Campaigns...");
  const arango = getArangoClient();

  const cursor = await arango.query(aql`
    FOR c IN Campaigns
      FILTER c.chain == "ethereum"
      AND LENGTH(c.events[* FILTER CURRENT.contract_address != null AND CURRENT.contract_event != null]) > 0
      RETURN {
        id: c.id,
        events: c.events[*
          FILTER CURRENT.contract_address != null AND CURRENT.contract_event != null
          RETURN {
            id: POSITION(c.events, CURRENT, true),
            address: CURRENT.contract_address,
            event: CURRENT.contract_event
          }
        ]
      }
  `);

  const campaings = await cursor.all();
  return campaings as ({ id: string, events: { id: number, address: string, event: string }[] })[];
}

function createObjectives(campaigns: { id: string, events: { id: number, address: string, event: string }[] }[]): Objective[] {
  const contractEvents = new Map<string, string[]>();

  campaigns.forEach(campaign => {
    campaign.events.forEach(event => {
      const events = contractEvents.get(event.address);

      if (events) {
        if (!events.find(e => e === event.event)) {
          events.push(event.event);
        }
      } else {
        contractEvents.set(event.address, [event.event])
      }
    })
  });

  const objectives: Objective[] = [];
  contractEvents.forEach((events, contract) => {
    objectives.push(new Objective(contract, events));
  })

  return objectives;
}

async function startListener(objectives: Objective[], onContractEvent: (event: ContractEvent) => void) {
  console.log("Starting Listener...");

  const provider = getJsonRpcProvider();
  console.log("getBlockNumber():", await provider.getBlockNumber());

  const eventFetcher = new EventFetcher(provider, objectives);
  const polling = new BlockPolling(provider, eventFetcher);
  const listener = new EventListener(polling);

  listener.onContractEvent((event: ContractEvent, done: () => void) => {
    // console.log("main: on block.confirmed", {
    //   blockNumber, events: events.map(e => e.topics[0])
    // });
    onContractEvent(event);
    done();
  });

  listener.start(1);
}

async function createConversion() {

}

async function main() {
  const campaigns = await loadCampaigns();
  const objectives = createObjectives(campaigns);

  const handleEvent = (event: ContractEvent): void => {
    const matchedCampaigns = campaigns.filter(c => c.events.some(e => e.address == event.contract && e.event == event.event));
    for (const campaign of matchedCampaigns) {
      const eventId = campaign.events.find(e => e.event == event.event)?.id

      const conversionData = {
        campaignId: campaign.id,
        eventId,
        contract: event.contract,
        event: event.event,
        from: event.from
      }

      console.log(conversionData);

      createConversion();
    }
  }

  startListener(objectives, handleEvent);
}

main();