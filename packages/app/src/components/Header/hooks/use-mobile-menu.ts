import { useEffect, useState } from "react";
import { Breakpoints } from "@/types";
import { useWindowSize } from "@/hooks";
import { useRouteChange } from "@/hooks/use-route-change";

/**
 * Hook to handle the mobile menu state.
 * Side effects:
 * - Closes the mobile menu when the route changes.
 * - Closes the mobile menu when the window size is larger than the large breakpoint.
 */
export const useMobileMenu = () => {
	const [showMobileMenu, setShowMobileMenu] = useState(false);

	const toggleMobileMenu = (state: boolean) => {
		return setShowMobileMenu(state);
	};

	const windowSize = useWindowSize();

	useEffect(() => {
		if (showMobileMenu && windowSize.width > Breakpoints.large) {
			toggleMobileMenu(false);
		}
	}, [showMobileMenu, windowSize]);

	useRouteChange(() => setShowMobileMenu(false));

	return {
		showMobileMenu,
		toggleMobileMenu,
		setShowMobileMenu
	};
};
