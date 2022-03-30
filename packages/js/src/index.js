// Entrance

import usher from "./usher";

if (typeof window !== "undefined") {
	window.Usher = usher;
}

export const Usher = usher;
