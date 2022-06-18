import chalk from "chalk";
import events from "./events";
import handleException from "./handle-exception";
import log from './logger';

class Listen {
	private intervalInstance: NodeJS.Timer;

	constructor(private fn: () => Promise<void>, private interval?: number = ) {
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
				handleException(e)
			});
		}, interval);
	}

	stop() {
		clearInterval(this.intervalInstance);
	}
}

export default Listen;
