import chalk from "chalk";
import { Command } from "commander";
import { Base64 } from "js-base64";
import { toString, fromString } from "uint8arrays";
import inquirer from "inquirer";

import { getNetworkDID, getAuthToken } from "@/utils/manager";

const cmd = new Command();

cmd
	.name("did")
	.description("Show DID for Key")
	.option("-k, --key <string>", "DID Key")
	.action(async (options) => {
		const did = await getNetworkDID(options.key);
		console.log(chalk.green(did.id));
	});

const decryptCmd = new Command();

decryptCmd
	.name("decrypt")
	.description("Decrypt a Base64 Encoded JWE")
	.option("-k, --key <string>", "DID Key")
	.action(async (options) => {
		const response = await inquirer.prompt([
			{
				name: "token",
				type: "input",
				message: "Please provide a Base64 Encoded JWE to Decrypt"
			}
		]);
		const { token } = response;
		const did = await getNetworkDID(options.key);
		const jwe = JSON.parse(Base64.decode(token));
		const dec = await did.decryptJWE(jwe);
		const str = toString(dec);
		console.log(chalk.green(`Token decrypted!`));
		console.log(str);
	});

const encryptCmd = new Command();

encryptCmd
	.name("encrypt")
	.description("Encrypt and encode a string")
	.option("-k, --key <string>", "DID Key")
	.option(
		"-r, --recipient <string...>",
		"Additional DID Recipients for the Encrypted Wallet"
	)
	.action(async (options) => {
		const response = await inquirer.prompt([
			{
				name: "token",
				type: "input",
				message: "Please provide a Raw Payload to Encrypt"
			}
		]);
		const { token } = response;
		const did = await getNetworkDID(options.key);
		const recipients = [did.id, ...(options.recipient || [])];
		const jwe = await did.createJWE(fromString(token), recipients);
		const str = JSON.stringify(jwe);
		const enc = Base64.encode(str);

		console.log(
			chalk.green(`Payload encrypted with recipients: ${recipients}!`)
		);
		console.log(enc);
	});

const authTokenCmd = new Command();

authTokenCmd
	.name("auth-token")
	.description("Get Auth Token for use with Next.js Usher dApp API")
	.option("-k, --key <string>", "DID Key")
	.action(async (options) => {
		const did = await getNetworkDID(options.key);
		const token = await getAuthToken(did);
		console.log(chalk.green(`Auth token for DID: ${did.id}!`));
		console.log(token);
	});

cmd.addCommand(encryptCmd);
cmd.addCommand(decryptCmd);
cmd.addCommand(authTokenCmd);

export default cmd;
