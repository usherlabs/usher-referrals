import cookies from "js-cookie";
import events from "@/utils/events";
import * as actions from "./actions";

Object.entries(actions).forEach(([actionName, actionFn]) => {
	events.on(actionName, actionFn);
});

const triggerEvent = (eventName, eventParams) => {
	events.emit(eventName, eventParams);
};

export default triggerEvent;

// Read from query parameter and save to cookie
// TODO: This mechanism will not work in the event the domain changes... or if loaded within a Browser Extension.
// TODO: What we really need here is iFrame communication... as the iframe will pertain data from a third party domain which can loaded into this.
(() => {
	const searchParams = new URLSearchParams(window.location.search);
	const convId = searchParams.get("usher_cid");
	cookies.set("usher_cid", convId, { expired: 7 });
})();
