import { useEffect } from "react";
import { initialize, emit, on } from "framebus";
import { parseCookies, destroyCookie } from "nookies";

const bus = initialize({
	channel: "usher_sat"
});

const Satellite = () => {
	useEffect(() => {
		on(bus, "ping", () => {
			const cookies = parseCookies();
			console.log(cookies);

			emit(bus, "cid", {
				cid: cookies.usher_cid || ""
			});
		});
		on(bus, "consume", () => {
			destroyCookie(null, "usher_cid");
		});

		emit(bus, "loaded");
	}, []);

	return null;
};

export default Satellite;
