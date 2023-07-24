import getArConnect from "@/utils/arconnect";
import { getMagicClient } from "@/utils/magic-client";
import { EVMConnections } from "@/utils/provider-utils";
import { Connections, EVMBasedChain } from "@usher.so/shared";
import { Partnerships } from "@usher.so/partnerships";
import { Authenticate } from "@usher.so/auth";

export const authenticateAndLoadPartnershipsForEVMAddress = async ({
	connection,
	address,
	chain,
	partnerships,
	authInstance
}: {
	connection: EVMConnections;
	address: string;
	chain: EVMBasedChain;
	partnerships: Partnerships;
	authInstance: Authenticate;
}) => {
	await authInstance.withEVMBasedChain(address, connection, chain);
	await partnerships.loadRelatedPartnerships();
};

export const authenticateAndLoadPartnershipsForArweave = async ({
	connection,
	address,
	partnerships,
	authInstance
}: {
	connection: Connections.ARCONNECT;
	address: string;
	partnerships: Partnerships;
	authInstance: Authenticate;
}) => {
	const arConnect = await getArConnect();
	if (arConnect) {
		await authInstance.withArweave(address, connection, arConnect);
		await partnerships.loadRelatedPartnerships();
	}
};

export const authenticateAndLoadPartnershipsForMagic = async ({
	partnerships,
	authInstance
}: {
	partnerships: Partnerships;
	authInstance: Authenticate;
}) => {
	const { magic, ethProvider: magicEthProvider } = getMagicClient();
	authInstance.setProvider("magic", magicEthProvider);
	const isLoggedIn = await magic.user.isLoggedIn();
	if (isLoggedIn) {
		// Magic will produce and authenticate multiple wallets for each blockchain it supports -- ie. Eth & Arweave
		await authInstance.withMagic();
		await partnerships.loadRelatedPartnerships();
	}
};
