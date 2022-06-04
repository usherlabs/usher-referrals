/**
 * Instatiate the Tile using the following
 * glaze model:add ar-network tile campaigns '{ "set": [] }' --schema=ceramic:// --key=
 */

import chalk from "chalk";
import { Command } from "commander";
import { DataModel } from "@glazed/datamodel";
import NetworkModel from "@models/Network.json";
import { getCeramic } from "../manager";

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

const program = new Command();

program
	.name("ar_campaigns")
	.description("CLI to control the Network ArCampaigns Stream");

program
	.command("add")
	.description("Add a Campaign Address (Arweave Tx) to the Stream Document")
	.argument("<string>", "Arweave Transaction ID")
	.action(async (id) => {
		const doc = await getDoc();
		const newCampaigns = [...doc.content.set, id];
		await doc.update(newCampaigns);
	});

program
	.command("rm")
	.description(
		"Remove a Campaign Address (Arweave Tx) from the Stream Document"
	)
	.argument("<string>", "Arweave Transaction ID")
	.action(async (id) => {
		const doc = await getDoc();
		await doc.update(
			doc.content.set.filter((address: string) => address !== id)
		);

		console.log(chalk.green(`ArNetwork Campaigns Stream updated successfully`));
	});

program
	.command("ls")
	.description("List Campaign Addresses in the Stream Document")
	.action(async () => {
		const doc = await getDoc();
		console.log(doc.content.set);
	});

program.parse();
