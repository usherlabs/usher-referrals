import { aql } from "arangojs";
import camelcaseKeys from "camelcase-keys";
import isEmpty from "lodash/isEmpty";
import { startBlock } from "./config";
import { convert } from "./conversion";
import { BlockPolling } from "./core/BlockPolling";
import { ContractEvent } from "./core/ContractEvent";
import { EventFetcher } from "./core/EventFetcher";
import { EventListener } from "./core/EventListener";
import { Objective } from "./core/Objective";
import { Campaign } from "./types";
import { getArangoClient } from "./utils/arango-client";
import { getJsonRpcProvider } from "./utils/json-rpc-provider";
import { log } from "./utils/logger";

async function loadCampaigns() {
	log.info("Loading Campaigns...");
	const arango = getArangoClient();

	const cursor = await arango.query(aql`
    FOR c IN Campaigns
      FILTER c.chain == "ethereum"
      AND LENGTH(c.events[* FILTER CURRENT.contract_address != null AND CURRENT.contract_address != null]) > 0
      RETURN {
        _id: c._id,
        events: c.events[*
          FILTER CURRENT.contract_address != null AND CURRENT.contract_address != null
          RETURN {
            eventId: POSITION(c.events, CURRENT, true),
            contract_address: CURRENT.contract_address,
            contract_event: CURRENT.contract_event
          }
        ]
      }
  `);

	const result = (await cursor.all()).filter((r) => !isEmpty(r));
	const formatted = camelcaseKeys(result, { deep: true });
	return formatted as {
		id: string;
		events: {
			eventId: number;
			contractAddress: string;
			contractEvent: string;
		}[];
	}[];
}

async function getCampaignAndPartnership(walletId: string, campaignId: string) {
	const arango = getArangoClient();

	const cursor = await arango.query(aql`
    LET wallet = DOCUMENT(Wallets, ${["ethereum", walletId].join(":")})

    FOR partnership IN 1..1 INBOUND wallet Referrals
        OPTIONS {
            vertexCollections: ["Partnerships"]
        }
        FOR campaign IN 1..1 OUTBOUND partnership Engagements
            OPTIONS {
                vertexCollections: ["Campaigns"]
            }
            FILTER campaign._id == ${campaignId}
            RETURN {
              campaign,
              partnershipId: partnership._id
            }
  `);

	const result = (await cursor.all()).filter((r) => !isEmpty(r));
	const formatted = camelcaseKeys(result, { deep: true });

	return (formatted.length === 1 ? result[0] : null) as {
		campaign: {
			_key: string;
		} & Campaign;
		partnershipId: string;
	};
}

function createObjectives(
	campaigns: {
		id: string;
		events: {
			eventId: number;
			contractAddress: string;
			contractEvent: string;
		}[];
	}[]
): Objective[] {
	const contractEvents = new Map<string, string[]>();

	campaigns.forEach((campaign) => {
		campaign.events.forEach((event) => {
			const events = contractEvents.get(event.contractAddress);

			if (events) {
				if (!events.find((e) => e === event.contractEvent)) {
					events.push(event.contractEvent);
				}
			} else {
				contractEvents.set(event.contractAddress, [event.contractEvent]);
			}
		});
	});

	const objectives: Objective[] = [];
	contractEvents.forEach((events, contract) => {
		objectives.push(new Objective(contract, events));
	});

	return objectives;
}

async function startListener(
	objectives: Objective[],
	onContractEvent: (event: ContractEvent) => void
) {
	log.info(
		{
			objectives
		},
		"Starting Listener..."
	);

	const provider = getJsonRpcProvider();

	const eventFetcher = new EventFetcher(provider, objectives);
	const polling = new BlockPolling(provider, eventFetcher);
	const listener = new EventListener(polling);

	listener.onContractEvent((event: ContractEvent, done: () => void) => {
		onContractEvent(event);
		done();
	});

	listener.start(startBlock);
}

async function main() {
	const campaigns = await loadCampaigns();
	const objectives = createObjectives(campaigns);

	const handleEvent = async (event: ContractEvent) => {
		const matchedCampaigns = campaigns.filter((c) =>
			c.events.some(
				(e) =>
					e.contractAddress === event.contractAddress &&
					e.contractEvent === event.contractEvent
			)
		);

		for (const matchedCampaign of matchedCampaigns) {
			// TODO: review await in a for loop
			// eslint-disable-next-line no-await-in-loop
			const r = await getCampaignAndPartnership(
				event.walletAddress,
				matchedCampaign.id
			);

			if (r) {
				const { campaign, partnershipId } = r;

				if (campaign != null) {
					const eventId = matchedCampaign.events.find(
						(e) => e.contractEvent === event.contractEvent
					)?.eventId;
					if (eventId !== undefined) {
						convert(campaign, eventId, partnershipId, event.transaction);
					}
				}
			}
		}
	};

	startListener(objectives, handleEvent);
}

main();
