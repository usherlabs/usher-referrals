import { Connections } from "@usher.so/shared";
import { EthWalletConnectButton } from "@/components/connect/buttons/EthWalletConnectButton";
import { ARWalletConnectButton } from "@/components/connect/buttons/ARWalletConnectButton";
import { WalletConnectButtonProps } from "@/components/connect/buttons/types";

export const WalletConnectButton = ({
	connection,
	...props
}: WalletConnectButtonProps) => {
	if (connection === Connections.ARCONNECT) {
		return <ARWalletConnectButton connection={connection} {...props} />;
	}
	return <EthWalletConnectButton connection={connection} {...props} />;
};
