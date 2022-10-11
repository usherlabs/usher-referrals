import { ethers } from "ethers";

export class Objective {
	readonly contract: string;

	readonly events: string[];

	readonly topics: string[];

	constructor(contract: string, events: string[]) {
		this.contract = contract;
		this.events = events;
		this.topics = events.map((e) => ethers.utils.id(e));
	}

	public eventByTopic(topic: string) {
		return this.events[this.topics.findIndex((value) => value === topic)];
	}
}
