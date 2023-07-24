import getArConnect from "@/utils/arconnect";
import delay from "@/utils/delay";
import { Connections } from "@usher.so/shared";
import { onboard } from "@/utils/onboard";
import { providerLabelByConnection } from "@/utils/provider-utils";
import { storedWallets } from "@/utils/wallets/stored-wallets";

export const disconnectWallet = async (type: Connections) => {
	switch (type) {
		case Connections.ARCONNECT: {
			const arconnect = await getArConnect();
			if (arconnect !== null) {
				await arconnect.disconnect();
				await delay(500);
			}

			// Reload the screen when a user disconnects their wallet
			window.location.reload();
			break;
		}
		case Connections.MAGIC: {
			// Open Magic Link Dialog Here...
			window.location.href = "/magic/logout";
			break;
		}
		case Connections.COINBASEWALLET:
		case Connections.METAMASK:
		case Connections.WALLETCONNECT: {
			const connectionWallets = onboard()
				.state.get()
				.wallets.filter((w) => w.label === providerLabelByConnection[type]);
			if (connectionWallets.length > 0) {
				// await onboard().disconnectWallet({ label: primaryWallet.label });
				connectionWallets.forEach((w) =>
					onboard().disconnectWallet({ label: w.label })
				);
			}
			break;
		}
		default: {
			break;
		}
	}
	storedWallets.removeByConnection(type);
};
