import { Connections } from "@usher.so/shared";
import React from "react";
import { Pane } from "evergreen-ui";
import { ConnectToWalletsButtonsList } from "@/components/connect/ConnectToWalletsButtonsList";

export type WalletConnectProps = {
	hide?: Connections[];
	onConnect?: (connection: string) => any;
	loading?: boolean;
};

export const USHER_SIGN_MESSAGE =
	"To create your Usher account, please click the 'Sign' button.";

const WalletConnect: React.FC<WalletConnectProps> = ({
	hide = [],
	onConnect = () => {},
	loading = false
}) => {
	return (
		<Pane display="flex" flexDirection="column">
			<ConnectToWalletsButtonsList
				hide={hide}
				signingMessage={USHER_SIGN_MESSAGE}
				isLoading={loading}
				onConnect={onConnect}
			/>
		</Pane>
	);
};

WalletConnect.defaultProps = {
	hide: []
};

export default WalletConnect;
