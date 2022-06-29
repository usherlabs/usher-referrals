import chalk from "chalk";
import { Command } from "commander";

import { getNetworkDID } from "@/utils/manager";

const cmd = new Command();

cmd
	.name("did")
	.description("Show DID for Key")
	.option("-k, --key <string>", "DID Key used to manage Ceramic models")
	.action(async (options) => {
		const did = await getNetworkDID(options.key);
		console.log(chalk.green(did.id));
	});

export default cmd;
