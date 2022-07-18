import EventEmitter from "eventemitter3";

const events = new EventEmitter();

export { events };

export enum AppEvents {
	PROFILE_SAVE = "profile_save",
	SAVE_USER = "save_user",
	REWARDS_CLAIM = "rewards_claim",
	START_PARTNERSHIP = "start_partnership",
	PAGE_LOAD = "page_load",
	PAGE_CHANGE = "page_change",
	PERSONHOOD = "personhood",
	CAPTCHA = "captcha",
	CONNECT = "connect",
	REFERRAL = "referral"
}
