import { useEffect, useState } from "react";

type WindowSize = {
	height: number;
	width: number;
};

export function useWindowSize() {
	const [size, setSize] = useState<WindowSize>({ height: 0, width: 0 });

	useEffect(() => {
		function updateSize() {
			setSize({
				height: window.innerHeight,
				width: window.innerWidth
			});
		}

		window.addEventListener("resize", updateSize);
		updateSize();

		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return size;
}
