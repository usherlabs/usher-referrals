import { useContext } from "react";

import { ContractContext } from "@/providers/Contract";

function useContract() {
	const { contract, loading, getContract } = useContext(ContractContext);

	return {
		contract,
		isLoading: loading,
		actions: {
			getContract
		}
	};
}

export default useContract;
