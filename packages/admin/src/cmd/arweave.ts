import chalk from "chalk";
import { Command } from "commander";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";

import { getNetworkDID } from "@/utils/manager";
import getArweaveClient from "@/utils/arweave-client";

const arweave = getArweaveClient();

const cmd = new Command();

cmd.name("arweave").description("Manage Arweave");

const walletCmd = new Command();

walletCmd.name("wallet").description("Wallets");

const newCmd = new Command();

newCmd
	.name("new")
	.description("Create a new Arweave CLI for internal purposes")
	.option("-k, --key <string>", "DID Key used to manage Ceramic models")
	.action(async (options) => {
		const key = await arweave.wallets.generate();
		const address = await arweave.wallets.jwkToAddress(key);
		const did = await getNetworkDID(options.key);
		const jwe = await did.createJWE(
			uint8arrays.fromString(JSON.stringify(key)),
			[did.id]
		);
		const str = JSON.stringify(jwe);
		const k = Base64.encode(str);

		console.log(chalk.green(`New wallet created!`));
		console.log({
			address,
			key: k
		});
	});

walletCmd.addCommand(newCmd);

cmd.addCommand(walletCmd);

export default cmd;
