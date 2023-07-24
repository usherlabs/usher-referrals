import { ProviderLabel } from "@/utils/onboard";
import { Chains, Connections } from "@usher.so/shared";

type ConnectionProps<T extends Chains, P extends ProviderLabel> = {
	chain: T;
	providerLabel: P;
};
// not entirely precise, but accurate enough for now
// to make it more precise only being more specific regarding to provider label on connection
export type PropsForConnection<C extends Connections> = Connections extends C
	? ConnectionProps<Chains, ProviderLabel>
	: Connections.ARCONNECT extends C
	? ConnectionProps<Chains.ARWEAVE, ProviderLabel.ArConnect>
	: ConnectionProps<
			Exclude<Chains, Chains.ARWEAVE>,
			Exclude<ProviderLabel, ProviderLabel.ArConnect>
	  >;

export type WalletConnectButtonProps<
	Connection extends Connections = Connections
> = {
	connection: Connection;
	text: string;
	icon: JSX.Element | any;
	providerLabel: ProviderLabel;
	signingMessage: string;
	isConnecting?: boolean;
	onConnect: (input: {
		connectedChain: Chains;
		connectedAddress: string;
		connection: Connection;
		signature: string;
	}) => Promise<void>;
};
