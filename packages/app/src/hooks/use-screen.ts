import { useMediaQuery } from "react-responsive";

import { Breakpoints } from "@/types";

const useScreen = (breakpoint: Breakpoints, isMax: boolean = false) => {
	return useMediaQuery(
		isMax ? { maxWidth: breakpoint - 1 } : { minWidth: breakpoint }
	);
};

export default useScreen;
