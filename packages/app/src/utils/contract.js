import isEmpty from "lodash/isEmpty";
import { smartweave } from "@/utils/smartweave";
import { advertiser } from "@/env-config";

let ContractState = {};

export const getContract = async () => {
	const contractAddress = advertiser.usherContractAddress;
	const contract = smartweave.contract(contractAddress);

	const currentState = await contract.readState();
	return currentState;
};

export const readContractState = async () => {
	if (!isEmpty(ContractState)) {
		return ContractState;
	}

	const currentState = (await getContract()).state;

	ContractState = currentState;

	return currentState;
};
