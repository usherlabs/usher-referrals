import { Connections, Wallet } from "@/types";

const defaultWallet: Wallet = {
	chains: [],
	connection: Connections.ARCONNECT,
	address: "",
	active: false
};

export default (wallets: Wallet[]) =>
	wallets.find(({ active }) => !!active) || defaultWallet;
