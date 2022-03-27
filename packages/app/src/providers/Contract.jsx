import React, {
	createContext,
	useEffect,
	useState,
	useMemo,
	useCallback
} from "react";

import { ChildrenProps } from "@/utils/common-prop-types";
import { getContract as getContractState } from "@/utils/contract";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";

export const ContractContext = createContext();

const ContractContextProvider = ({ children }) => {
	const [contract, setContract] = useState({
		strategy: "",
		rate: 0,
		token: {
			name: "",
			ticker: "",
			type: ""
		},
		limit: 0
	});
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
			handleException(e);
			alerts.error();
		}
		setLoading(false);
		return {};
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

ContractContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default ContractContextProvider;
