import DashboardScreen from "@/screens/Dashboard";
import DashboardContainer from "@/containers/Dashboard";
import UserProvider from "@/providers/User";
import WalletProvider from "@/providers/Wallet";

const Overview = () => {
	return (
		<UserProvider>
			<WalletProvider>
				<DashboardContainer>
					<DashboardScreen />
				</DashboardContainer>
			</WalletProvider>
		</UserProvider>
	);
};

export default Overview;
