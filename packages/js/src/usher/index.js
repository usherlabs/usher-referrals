import events from "@/utils/events";
import { satelliteUrl } from "@/env-config";
import * as actions from "./actions";

Object.entries(actions).forEach(([actionName, actionFn]) => {
	events.on(actionName, actionFn);
});

const triggerEvent = (eventName, eventParams) => {
	events.emit(eventName, eventParams);
};

export default triggerEvent;

(() => {
	// Remove any existing Satellite
	const existingSatEl = document.getElementById("usher-satellite");
	if (existingSatEl) {
		existingSatEl.parentNode.removeChild(existingSatEl);
	}

	// Render a new Satellite
	const satEl = document.createElement("iframe");
	satEl.setAttribute("id", "usher-satellite");
	satEl.setAttribute("src", satelliteUrl);
	document.body.append(satEl);
})();
