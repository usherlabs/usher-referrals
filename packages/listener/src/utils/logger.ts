import pino from "pino";
import { appName, isProd, logLevel } from "../config";

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
