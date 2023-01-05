// Asked what happens to data that conformed to the previous schema
// https://discord.com/channels/682786569857662976/937412186781909012/980337586734248007
// Could be that we create a new definition with backward compatibility?

import chalk from "chalk";
import { Command } from "commander";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import jsonfile from "jsonfile";

import { getCeramic } from "@/utils/manager";

const cmd = new Command();

cmd.name("schema").description("Manage Usher Ceramic Schema");

const updateCmd = new Command();

updateCmd
	.name("update")
	.description("Update Schema in a Ceramic Model")
	.argument("<id>", "Schema Stream ID that will be updated")
	.argument(
		"<filepath>",
		"Path to Schema file that will be used as the updated version"
	)
	//  .argument('<deploypath>', 'Path to Deployed Model file that will replaced with the updated version')
	.option("-k, --key <string>", "DID Key")
	.action(async (id, filepath, options) => {
		const ceramic = await getCeramic(options.key);
		const schema = await jsonfile.readFile(filepath);
		const doc = await TileDocument.load(ceramic, id);
		await doc.update(schema);
		console.log(
			chalk.green(`Schema stream ${doc.id.toString()} has been updated`)
		);
	});

cmd.addCommand(updateCmd);

export default cmd;
