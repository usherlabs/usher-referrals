import { useEffect } from "react";
import Framebus from "framebus";
import { parseCookies, destroyCookie } from "nookies";
import { CONVERSION_COOKIE_NAME } from "@/constants";

const bus = new Framebus({
	channel: "usher_sat"
});

const Satellite = () => {
	useEffect(() => {
		const cookies = parseCookies();
		console.log("SATELLITE:", cookies); //! DEV

		bus.on("ping", () => {
			bus.emit("cid", {
				cid: cookies[CONVERSION_COOKIE_NAME] || ""
			});
		});
		bus.on("consume", () => {
			destroyCookie(null, CONVERSION_COOKIE_NAME);
		});

		bus.emit("loaded");
	}, []);

	return null;
};

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default Satellite;
