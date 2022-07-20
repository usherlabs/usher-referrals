import chalk from "chalk";
import { Command } from "commander";
import got from "got";

import { getNetworkDID, getAuthToken } from "@/utils/manager";

const cmd = new Command();

cmd.name("app").description("Admin utils for the Next.js Usher dApp");

const revalidateCmd = new Command();

revalidateCmd
	.name("revalidate")
	.description("Get Auth Token for use with Next.js Usher dApp API")
	.option("-k, --key <string>", "DID Key")
	.option("-p, --path <string>", "dApp Path to revalidate")
	.option("-h, --host <string>", "dApp host/origin", "https://app.usher.so")
	.action(async (options) => {
		if (!options.path) {
			console.log(chalk.red(`Revalidating path is required!`));
			return;
		}
		const did = await getNetworkDID(options.key);
		const token = await getAuthToken(did);
		const url = `${options.host}/api/revalidate?path=${options.path}`;
		console.log(chalk.yellow(`Revalidating: ${url} ...`));
		const resp = await got
			.get(url, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.json();
		console.log(chalk.green(`Path Revalidated: ${options.path}`));
		console.log(resp);
	});

cmd.addCommand(revalidateCmd);

export default cmd;
