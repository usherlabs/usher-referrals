import isEmpty from "lodash/isEmpty";
import delay from "@/utils/delay";

let ContractState = {};

export const getContract = async () => {
	await delay(1000);
	// TODO: Remove Dev Data
	return {
		state: {
			strategy: "flat",
			rate: 0.15,
			token: {
				name: "Arweave",
				ticker: "AR",
				type: "token"
			},
			limit: 60
			// conflictStrategy: ContractConflictStrategy.PASSTHROUGH
		}
	};
	// const contractAddress = advertiser.usherContractAddress;
	// const contract = smartweave.contract(contractAddress);

	// const currentState = await contract.readState();
	// return currentState;
};

export const readContractState = async () => {
	if (!isEmpty(ContractState)) {
		return ContractState;
	}

	const currentState = (await getContract()).state;

	ContractState = currentState;

	return currentState;
};
