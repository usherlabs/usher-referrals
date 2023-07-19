import { RequestNetworkSwitch } from "@/utils/user-state-management/components/RequestNetworkSwitch";
import { RequestSign } from "@/utils/user-state-management/components/RequestSign";
import { useConnectOnlyToLatestAccount } from "@/utils/user-state-management/components/ConnectOnlyToLatestAccount";
import { useConnectToLastAccountOnPageLoad } from "@/utils/user-state-management/components/ConnectToLastAccountOnPageLoad";

export const ManageWalletsConnection = () => {
	useConnectOnlyToLatestAccount();
	useConnectToLastAccountOnPageLoad();
	return (
		<>
			<RequestNetworkSwitch />
			<RequestSign />
		</>
	);
};
