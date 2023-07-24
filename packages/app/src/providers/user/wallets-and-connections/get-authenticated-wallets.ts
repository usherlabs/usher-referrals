import { Connections, EVMBasedChain, Wallet } from "@usher.so/shared";
import { Partnerships } from "@usher.so/partnerships";
import { Authenticate } from "@usher.so/auth";
import handleException from "@/utils/handle-exception";
import pascalCase from "@/utils/pascal-case";
import { toaster } from "evergreen-ui";
import {
	getUnauthenticatedAddressForArweave,
	getUnauthenticatedWalletsForEVMConnection
} from "@/providers/user/wallets-and-connections/get-unauthenticated-wallets";
import {
	authenticateAndLoadPartnershipsForArweave,
	authenticateAndLoadPartnershipsForEVMAddress,
	authenticateAndLoadPartnershipsForMagic
} from "@/providers/user/wallets-and-connections/authenticate-and-load-partnerships";
import { getChainById } from "@/utils/get-chain-by-id";
import { StoredWallet } from "@/utils/wallets/stored-wallets";
import { isEthereumBasedNetwork } from "@/utils/isEthereumBasedNetwork";

export const getAuthenticatedWalletsAndLoadPartnershipsForConnection = async ({
	connection,
	authInstance,
	partnerships
}: {
	connection: Connections;
	authInstance: Authenticate;
	partnerships: Partnerships;
}): Promise<Wallet[]> => {
	try {
		// this switch case will only try to fetch addresses and then
		// try to authenticate them.
		// we will try to get wallets only after doing this process.
		switch (connection) {
			case Connections.ARCONNECT: {
				const arweaveWalletAddress =
					await getUnauthenticatedAddressForArweave();
				if (arweaveWalletAddress) {
					await authenticateAndLoadPartnershipsForArweave({
						connection,
						address: arweaveWalletAddress,
						partnerships,
						authInstance
					});
				}
				break;
			}
			case Connections.MAGIC: {
				await authenticateAndLoadPartnershipsForMagic({
					partnerships,
					authInstance
				});
				break;
			}
			case Connections.COINBASEWALLET:
			case Connections.METAMASK:
			case Connections.WALLETCONNECT: {
				const connectionWallets =
					await getUnauthenticatedWalletsForEVMConnection({
						connection
					});
				for (const wallet of connectionWallets) {
					for (const account of wallet.accounts) {
						for (const chain of wallet.chains) {
							// we want to do it sequentially. Parallelism could go wrong to load multiple wallets
							const chainById = getChainById(chain.id);
							if (isEthereumBasedNetwork(chainById)) {
								// eslint-disable-next-line no-await-in-loop
								await authenticateAndLoadPartnershipsForEVMAddress({
									connection,
									address: account.address,
									partnerships,
									chain: chainById,
									authInstance
								});
							}
						}
					}
				}
				break;
			}
			default: {
				// will make typescript unhappy if switch isn't exhausting
				const shouldBeNeverType: never = connection;
				// devs should work on this. Not user concern.
				console.error(`Unknown connection: ${shouldBeNeverType}`);
				throw new Error("Unknown connection");
			}
		}
		return authInstance.getWallets();
	} catch (e) {
		toaster.warning(`Could not authenticate with ${pascalCase(connection)}`);
		handleException(e);
		return [];
	}
};

// same as above, but won't fetch wallets from providers first, will take wallets a arg
export const authenticateAnyWallet = async ({
	wallet: { address, chain, connection },
	authInstance,
	partnerships
}: {
	wallet: StoredWallet;
	authInstance: Authenticate;
	partnerships: Partnerships;
}) => {
	switch (connection) {
		case Connections.ARCONNECT: {
			await authenticateAndLoadPartnershipsForArweave({
				partnerships,
				connection,
				address,
				authInstance
			});
			break;
		}
		case Connections.MAGIC: {
			await authenticateAndLoadPartnershipsForMagic({
				authInstance,
				partnerships
			});
			break;
		}
		case Connections.COINBASEWALLET:
		case Connections.WALLETCONNECT:
		case Connections.METAMASK: {
			await authenticateAndLoadPartnershipsForEVMAddress({
				partnerships,
				authInstance,
				connection,
				address,
				chain: chain as EVMBasedChain // todo could be safer than this
			});
			break;
		}
		default: {
			throw new Error(`Unknown wallet connection: ${connection}`);
		}
	}
	return authInstance.getWallets();
};
