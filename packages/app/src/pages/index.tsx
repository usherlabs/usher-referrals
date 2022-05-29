// Partnerships is the Index page because we want them to login and get their link as fast as possible.

import { useEffect } from "react";
import { useRouter } from "next/router";

import { useUser } from "@/hooks";
import DashboardScreen from "@/screens/Dashboard";
import DashboardContainer from "@/containers/Dashboard";

const Partnerships = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();

	useEffect(() => {
		// If user is no longer loading and there is still no wallet loaded...
		if (!isLoading && wallets.length === 0) {
			router.push("/explore"); // Redirect to explore page if not authorised.
		}
	}, [wallets, isLoading]);

	return (
		<DashboardContainer>
			<DashboardScreen />
		</DashboardContainer>
	);
};

export default Partnerships;
