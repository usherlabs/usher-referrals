import { ethers } from "ethers"

let ethereum: ethers.providers.Web3Provider;

export const getEthereumClient = (useLocal = false) => {
	if (!ethereum &&
		typeof window !== 'undefined' &&
		typeof window.ethereum !== 'undefined') {
		ethereum = new ethers.providers.Web3Provider(window.ethereum);
	}
	return ethereum;
};
