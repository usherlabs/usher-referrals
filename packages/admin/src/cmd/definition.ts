import chalk from "chalk";
import { Command } from "commander";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import { getCeramic } from "@/utils/manager";

const cmd = new Command();

cmd.name("definition").description("Manage Usher Ceramic Definitions");

const updateCmd = new Command();

updateCmd
	.name("update")
	.description("Update Definition in a Ceramic Model")
	.argument("<id>", "Definition Stream ID that will be updated")
	.argument(
		"<content>",
		"Definition JSON string that will be used as the updated version"
	)
	//  .argument('<deploypath>', 'Path to Deployed Model file that will replaced with the updated version')
	.option("-k, --key <string>", "DID Key")
	.action(async (id, content, options) => {
		const ceramic = await getCeramic(options.key);
		const doc = await TileDocument.load(ceramic, id);
		await doc.update(content);
		console.log(
			chalk.green(`Definition stream ${doc.id.toString()} has been updated`)
		);
	});

cmd.addCommand(updateCmd);

export default cmd;
