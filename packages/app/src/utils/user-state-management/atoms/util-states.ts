import { atom } from "jotai";
import { onboardAtoms } from "@/utils/user-state-management/atoms/onboard-state";
import { UNSUPPORTED_EVM_CHAIN } from "@/utils/get-chain-by-id";

const connectedToUnsupportedChains = atom((get) => {
	const accounts = get(onboardAtoms.connectedAccounts);
	return accounts.length > 0
		? accounts.every((a) => a.chain === UNSUPPORTED_EVM_CHAIN)
		: false;
});

const connectedToUnsignedAccount = atom((get) => {
	const primaryAccount = get(onboardAtoms.primaryAccount);
	const unsignedAccounts = get(onboardAtoms.connectedUnsignedAccounts);

	return unsignedAccounts.some(
		(u) =>
			u.address === primaryAccount.address &&
			u.chain === primaryAccount.chain &&
			u.connection === primaryAccount.connection
	);
});

export const utilStateAtoms = {
	connectedToUnsupportedChains,
	connectedToUnsignedAccount
};
