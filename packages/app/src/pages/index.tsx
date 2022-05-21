import DashboardScreen from "@/screens/Dashboard";
import DashboardContainer from "@/containers/Dashboard";
import UserProvider from "@/providers/User";

const Overview = () => {
	return (
		<UserProvider>
			{/* <DashboardContainer>
				<DashboardScreen />
			</DashboardContainer> */}
		</UserProvider>
	);
};

export default Overview;
