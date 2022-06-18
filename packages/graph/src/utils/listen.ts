import chalk from "chalk";
import events from "./events";
import handleException from "./handle-exception";
import log from "./logger";

class Listen {
	private intervalInstance: NodeJS.Timer | null = null;

	constructor(
		private fn: () => Promise<void>,
		private interval: number = 5 * 60 * 1000
	) {
		events.on("PROCESS_EXIT", () => {
			this.stop();
		});
	}

	start() {
		const { fn, interval } = this;
		this.intervalInstance = setInterval(() => {
			fn().catch((e) => {
				log.info(
					chalk.red(`An error has occurred, but we persist until you cancel.`)
				);
				handleException(e);
			});
		}, interval);
	}

	stop() {
		if (this.intervalInstance !== null) {
			clearInterval(this.intervalInstance);
		}
	}
}

export default Listen;
