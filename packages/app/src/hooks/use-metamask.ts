// import { useEffect, useState } from "react";
// import getMetaMask from "@/utils/metamask";

// const useMetaMask = (): [typeof getMetaMask, boolean] => {
// 	const [isLoading, setLoading] = useState(true);

// 	useEffect(() => {
// 		if (window.ethereum) {
// 			setLoading(false);
// 		} else {
// 			window.addEventListener("ethereum#initialized", () => {
// 				setLoading(false);
// 			});
// 			const interval = setInterval(() => {
// 				if (window.ethereum) {
// 					clearInterval(interval);
// 					setLoading(false);
// 				}
// 			}, 500);
// 			const timeout = setTimeout(() => {
// 				clearInterval(interval);
// 				setLoading(false); // MetaMask not loaded...
// 			}, 2000);

// 			return () => {
// 				clearTimeout(timeout);
// 				clearInterval(interval);
// 			};
// 		}
// 		return () => {};
// 	}, []);

// 	return [getMetaMask, isLoading];
// };

// export default useMetaMask;
export default {};
