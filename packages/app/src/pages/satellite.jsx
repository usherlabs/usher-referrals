import { useEffect } from "react";
import Framebus from "framebus";
import { parseCookies, destroyCookie } from "nookies";

const bus = new Framebus({
	channel: "usher_sat"
});

const Satellite = () => {
	useEffect(() => {
		bus.on("ping", () => {
			const cookies = parseCookies();
			console.log("SATELLITE:", cookies); //! DEV

			bus.emit("cid", {
				cid: cookies.usher_cid || ""
			});
		});
		bus.on("consume", () => {
			destroyCookie(null, "__usher_cid");
		});

		bus.emit("loaded");
	}, []);

	return null;
};

export default Satellite;
