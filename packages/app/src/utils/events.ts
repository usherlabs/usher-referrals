import EventEmitter from "eventemitter3";

const events = new EventEmitter();

export { events };

export enum AppEvents {
	PROFILE_SAVE = "profile_save"
}
