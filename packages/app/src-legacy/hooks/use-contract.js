import { useContext } from "react";

import { ContractContext } from "@/providers/Contract";

function useContract() {
	const { contract, loading, getContract } = useContext(ContractContext);

	return [
		contract,
		loading,
		{
			getContract
		}
	];
}

export default useContract;
