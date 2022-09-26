import { ethers } from "ethers";

export default () => {
  if (typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined') {
    // TODO: Use Mainnet for production
    const provider = new ethers.providers.Web3Provider(window.ethereum, 1337);
    return provider;
  }

  return null;
};
