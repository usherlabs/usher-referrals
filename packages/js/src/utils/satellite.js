import { satelliteUrl } from "@/env-config";
import Bus from "@/utils/bus";

const elementId = "usher-satellite";

class Satellite {
	get isLoaded() {
		return !!document.getElementById(elementId);
	}

	async load() {
		// Render a new Satellite
		const satEl = document.createElement("iframe");
		satEl.setAttribute("id", "usher-satellite");
		satEl.setAttribute("src", satelliteUrl);
		document.body.append(satEl);
		await new Promise((resolve) => {
			Bus.on("loaded", () => {
				resolve();
			});
		});
	}

	remove() {
		// Remove any existing Satellite
		const existingSatEl = document.getElementById("usher-satellite");
		if (existingSatEl) {
			existingSatEl.parentNode.removeChild(existingSatEl);
		}
	}
}

export default Satellite;
