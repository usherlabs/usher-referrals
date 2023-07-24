import { Connections, Wallet } from "@usher.so/shared";
import { BehaviorSubject } from "rxjs";
import { atomWithObservable } from "jotai/utils";

export type StoredWallet = Wallet & { signature: string };

const getStoredWallets = () =>
	typeof window === "undefined"
		? []
		: (JSON.parse(
				window.localStorage.getItem("connectedWallets") || "[]"
		  ) as StoredWallet[]);

const storedWallets$ = new BehaviorSubject(getStoredWallets());

const updateWalletsObservable = () => {
	storedWallets$.next(getStoredWallets());
};

function setOnLocalStorageOnly(wallets: StoredWallet[]) {
	window.localStorage.setItem("connectedWallets", JSON.stringify(wallets));
}

const setStoredWallets = (wallets: StoredWallet[]) => {
	setOnLocalStorageOnly(wallets);
	updateWalletsObservable();
};

const addStoredWallet = (newWallets: StoredWallet | StoredWallet[]) => {
	const normalizedWallets = Array.isArray(newWallets)
		? newWallets
		: [newWallets];
	setStoredWallets(normalizedWallets.slice(0, 1));

	// TODO support multi wallet
	// const wallets = getStoredWallets();
	// wallets.push(...(Array.isArray(newWallets) ? newWallets : [newWallets]));
	// setStoredWallets(deduplicateObjectArray(wallets));
	updateWalletsObservable();
};

export const storedWalletsAtom = atomWithObservable<StoredWallet[]>(
	() => storedWallets$,
	{ initialValue: storedWallets$.getValue() }
);

const removeAllStoredWallets = () => {
	setStoredWallets([]);
};

const removeByConnection = (connection: Connections) => {
	const wallets = getStoredWallets();
	const newWallets = wallets.filter((w) => w.connection !== connection);
	setStoredWallets(newWallets);
};

export const storedWallets = {
	get: getStoredWallets,
	set: setStoredWallets,
	add: addStoredWallet,
	removeByConnection,
	removeAll: removeAllStoredWallets
};
