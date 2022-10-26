import { ethers } from "ethers";

export default () => {
	if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		return provider;
	}

	return null;
};
