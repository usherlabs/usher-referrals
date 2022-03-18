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
			console.log(cookies); //! DEV
			cookies.usher_cid = "123456"; //! DEV

			bus.emit("cid", {
				cid: cookies.usher_cid || ""
			});
		});
		bus.on("consume", () => {
			destroyCookie(null, "usher_cid");
		});

		bus.emit("loaded");
	}, []);

	return null;
};

export default Satellite;
