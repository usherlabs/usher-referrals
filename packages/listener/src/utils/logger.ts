import { appName, isProd, logLevel } from "../config";
import pino from "pino";

export const log = pino({
	name: appName,
	level: logLevel || "info",
	transport: !isProd
		? {
				target: "pino-pretty",
				options: {
					colorize: true
				}
		  }
		: undefined
});
