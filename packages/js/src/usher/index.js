import events from "@/utils/events";
import * as actions from "./actions";

Object.entries(actions).forEach(([actionName, actionFn]) => {
	events.on(actionName, actionFn);
});

const triggerEvent = (eventName, eventParams) => {
	events.emit(eventName, eventParams);
};

export default triggerEvent;
