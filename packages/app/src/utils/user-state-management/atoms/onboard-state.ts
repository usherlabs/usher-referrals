import { atomWithObservable } from "jotai/utils";
import { atom } from "jotai/index";
import { onboardAtom, ProviderLabel } from "@/utils/onboard";
import { storedWalletsAtom } from "@/utils/wallets/stored-wallets";
import { getChainById, UNSUPPORTED_EVM_CHAIN } from "@/utils/get-chain-by-id";
import { connectionByProviderLabel } from "@/utils/provider-utils";

const onboardState = atom((get) => get(onboardAtom).state);

const connectedWallets = atomWithObservable(
	(get) => get(onboardState).select("wallets"),
	{ initialValue: [] }
);

const connectedAccounts = atom((get) => {
	const wallets = get(connectedWallets);
	return wallets
		.map((w) => ({
			accounts: w.accounts,
			chains: w.chains,
			providerLabel: w.label,
			provider: w.provider
		}))
		.map((w) => {
			const { accounts, chains } = w;
			if (!(w.providerLabel in connectionByProviderLabel)) {
				throw new Error("Unsupported provider");
			}
			const providerLabel = w.providerLabel as ProviderLabel;
			return accounts.map(({ address }) =>
				chains.map(({ id }) => ({
					chain: getChainById(id),
					chainId: id,
					providerLabel,
					provider: w.provider,
					connection: connectionByProviderLabel[providerLabel],
					address
				}))
			);
		})
		.flat(2);
});

const primaryAccount = atom((get) => {
	const accounts = get(connectedAccounts);
	return accounts[0];
});

// there are accounts that are connected, but no signature has been fetched from it yet.
// usually when there's signature, we store it in local storage.
// so we can use this atom to filter out accounts that are connected but not signed yet.
const connectedUnsignedAccounts = atom((get) => {
	const accounts = get(connectedAccounts);
	const signedAccounts = get(storedWalletsAtom);

	return accounts.filter(
		(a) =>
			!signedAccounts.some(
				(s) =>
					s.address === a.address &&
					s.connection === a.connection &&
					s.chain === a.chain &&
					// we want only accounts that are connected to supported chains here
					// our intention to use this is later know what accounts can yet be signed
					// @ts-expect-error TODO: fix this
					a.chain !== UNSUPPORTED_EVM_CHAIN
			)
	);
});

export const onboardAtoms = {
	connectedWallets,
	connectedUnsignedAccounts,
	connectedAccounts,
	primaryAccount
};
