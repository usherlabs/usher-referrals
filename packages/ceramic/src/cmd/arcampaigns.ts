/**
 * Instatiate the Tile using the following
 * glaze model:add ar-network tile campaigns '{ "set": [] }' --schema=ceramic:// --key=
 */

import chalk from "chalk";
import { Command } from "commander";
import { DataModel } from "@glazed/datamodel";
import { NetworkModel } from "..";
import { getCeramic } from "../utils/manager";

const getDoc = async () => {
	const ceramic = await getCeramic();
	const model = new DataModel({ ceramic, aliases: NetworkModel });
	const doc = await model.loadTile("ar_campaigns");
	if (!doc) {
		console.log(chalk.red(`Cannot load the ArNetwork Campaigns Stream!`));
		process.exit(1);
	}
	return doc;
};

const cmd = new Command();

cmd
	.name("arcampaigns")
	.description("CLI to control the Network ArCampaigns Stream");

cmd
	.command("add")
	.description("Add a Campaign Address (Arweave Tx) to the Stream Document")
	.argument("<string>", "Arweave Transaction ID")
	.action(async (id) => {
		const doc = await getDoc();
		const newCampaigns = [...doc.content.set, id];
		await doc.update(newCampaigns);
	});

cmd
	.command("rm")
	.description(
		"Remove a Campaign Address (Arweave Tx) from the Stream Document"
	)
	.argument("<string>", "Arweave Transaction ID")
	.action(async (id) => {
		const doc = await getDoc();
		await doc.update(doc.content.set.filter((txId: string) => txId !== id));

		console.log(chalk.green(`ArNetwork Campaigns Stream updated successfully`));
	});

cmd
	.command("ls")
	.description("List Campaign Addresses in the Stream Document")
	.action(async () => {
		const doc = await getDoc();
		console.log(doc.content.set);
	});

export default cmd;
