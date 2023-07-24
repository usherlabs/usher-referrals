import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

/**
 * Hook to detect route changes. Also calls a callback function when the route changes.
 * @param routeChangeCompleteCallback
 */
export const useRouteChange = (
	routeChangeCompleteCallback?: (url: string) => void
) => {
	const [currentPathname, setCurrentPathname] = useState("");
	const router = useRouter();

	const onRouteChangeComplete = useCallback(
		(url: string) => {
			if (url !== currentPathname) {
				setCurrentPathname(url);
			}
			routeChangeCompleteCallback?.(url);
		},
		[currentPathname, routeChangeCompleteCallback]
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setCurrentPathname(window.location.pathname);
		}

		router.events.on("routeChangeComplete", onRouteChangeComplete);
		return () => {
			router.events.off("routeChangeComplete", onRouteChangeComplete);
		};
	}, [onRouteChangeComplete, router.events]);

	return { currentPathname };
};
