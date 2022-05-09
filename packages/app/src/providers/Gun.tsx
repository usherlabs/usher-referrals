import React, { createContext, useEffect, useState, useMemo } from "react";

import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { IGunContext } from "@/types";

type Props = {
	children: React.ReactNode;
};

export const GunContext = createContext<IGunContext>({
	loading: false
});

const GunContextProvider: React.FC<Props> = ({ children }) => {
	const [loading, setLoading] = useState(true);

	// On render, fetch state from smart contract
	useEffect(() => {
		(async () => {
			// eslint-disable-line
			try {
				// await initPeers();
				setLoading(false);
			} catch (e) {
				if (e instanceof Error) {
					handleException(e, null);
				}
				alerts.error();
			}
			setLoading(false);
		})();
	}, []);

	const value = useMemo(
		() => ({
			loading
		}),
		[loading]
	);

	return <GunContext.Provider value={value}>{children}</GunContext.Provider>;
};

export default GunContextProvider;
