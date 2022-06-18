import events from "./utils/events";
import Conversions from "./conversions";
import log from "./utils/logger";

// Handle process exit
process.stdin.resume(); // so the program will not close instantly

function exitHandler(
	options: { exit: boolean },
	exitCode: number | null | undefined
) {
	events.emit("PROCESS_EXIT");
	if (exitCode || exitCode === 0) {
		log.info(`Exit code:`, exitCode);
	}
	if (options.exit) {
		process.exit();
	}
}

// do something when app is closing
// process.on("exit", exitHandler.bind(null, { cleanup: true }));
// catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
// catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

// Start the Graph Service
(async () => {
	console.log(`Starting Graph Service...`);

	// Establish connection with ArangoDB

	// Listen to conversions.
	Conversions.listen();
})();
