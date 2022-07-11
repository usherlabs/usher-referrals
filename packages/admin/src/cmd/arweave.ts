import chalk from "chalk";
import { Command } from "commander";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";

import { getNetworkDID } from "@/utils/manager";
import { getArweaveClient } from "@/utils/arweave-client";

const cmd = new Command();

cmd.name("arweave").description("Manage Arweave");

const walletCmd = new Command();

walletCmd.name("wallet").description("Wallets");

const newCmd = new Command();

newCmd
	.name("new")
	.description("Create a new Arweave Wallet for internal Campaign purposes")
	.option("-k, --key <string>", "DID Key")
	.option("-l, --local", "Use Arweave Local")
	.option(
		"-r, --recipient <string...>",
		"Additional DID Recipients for the Encrypted Wallet"
	)
	.action(async (options) => {
		const arweave = getArweaveClient(options.local || false);
		const key = await arweave.wallets.generate();
		const address = await arweave.wallets.jwkToAddress(key);
		const did = await getNetworkDID(options.key);
		const recipients = [did.id, ...(options.recipient || [])];
		const jwe = await did.createJWE(
			uint8arrays.fromString(JSON.stringify(key)),
			recipients
		);
		const str = JSON.stringify(jwe);
		const k = Base64.encode(str);

		console.log(chalk.green(`New wallet created!`));
		console.log({
			recipients,
			address,
			key: k
		});
	});

walletCmd.addCommand(newCmd);

cmd.addCommand(walletCmd);

export default cmd;
