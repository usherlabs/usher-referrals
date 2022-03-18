import { satelliteUrl } from "@/env-config";
import Bus from "@/utils/bus";

const elementId = "usher-satellite";

class Satellite {
	static get isLoaded() {
		return !!document.getElementById(elementId);
	}

	static async load() {
		// Render a new Satellite
		const satEl = document.createElement("iframe");
		satEl.setAttribute("id", "usher-satellite");
		satEl.setAttribute("src", satelliteUrl);
		satEl.setAttribute(
			"style",
			`position:absolute !important;left:-9999px !important;top:-9999px !important;pointer-events:none !important;opacity:0 !important;visibility:hidden !important;display:none !important;height:0 !important;width:0 !important;`
		);
		document.body.append(satEl);
		await new Promise((resolve) => {
			Bus.on("loaded", () => {
				resolve();
			});
		});
	}

	static remove() {
		// Remove any existing Satellite
		const existingSatEl = document.getElementById("usher-satellite");
		if (existingSatEl) {
			existingSatEl.parentNode.removeChild(existingSatEl);
		}
	}
}

export default Satellite;
