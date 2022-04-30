import React, {
	createContext,
	useEffect,
	useState,
	useMemo,
	useCallback
} from "react";

import { Contract, IContractContext, ContractConflictStrategy } from "@/types";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { getContract as getContractState } from "@/utils/contract";

type Props = {
	children: React.ReactNode;
};

const defaultContractValues = {
	strategy: "",
	rate: 0,
	token: {
		name: "",
		ticker: "",
		type: ""
	},
	limit: 0,
	conflictStrategy: ContractConflictStrategy.PASSTHROUGH
} as const;

export const ContractContext = createContext<IContractContext>({
	contract: defaultContractValues,
	loading: false,
	async getContract() {
		return defaultContractValues;
	}
});

const ContractContextProvider: React.FC<Props> = ({ children }) => {
	const [contract, setContract] = useState<Contract>(defaultContractValues);
	const [loading, setLoading] = useState(true);

	const getContract = useCallback(async () => {
		// eslint-disable-line
		setLoading(true);
		try {
			const contractState = (await getContractState()).state;
			setContract(contractState);
			setLoading(false);
			return contractState;
		} catch (e) {
			if (e instanceof Error) {
				handleException(e, null);
			}
			alerts.error();
		}
		setLoading(false);
		return defaultContractValues;
	}, []);

	// On render, fetch state from smart contract
	useEffect(() => {
		getContract();
	}, []);

	const value = useMemo(
		() => ({
			contract,
			loading,
			getContract
		}),
		[contract, loading]
	);

	return (
		<ContractContext.Provider value={value}>
			{children}
		</ContractContext.Provider>
	);
};

export default ContractContextProvider;
