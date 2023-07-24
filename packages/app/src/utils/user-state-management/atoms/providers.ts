import { atom } from "jotai/index";
import { getArweaveClient, getWarp } from "@/utils/arweave-client";
import { getEthereumClient } from "@/utils/ethereum-client";
import { ethers } from "ethers";

const arweaveAtom = atom(() => getArweaveClient());
const ethProviderAtom = atom(
	() => getEthereumClient() as ethers.providers.Web3Provider
);
const warpAtom = atom((get) => getWarp(get(arweaveAtom)));
export const providersAtoms = {
	arweave: arweaveAtom,
	ethProvider: ethProviderAtom,
	warp: warpAtom
};
