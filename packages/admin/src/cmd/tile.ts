import util from "util";
import chalk from "chalk";
import { Command } from "commander";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import { getCeramic } from "@/utils/manager";

const cmd = new Command();

cmd.name("tile").description("Manage Usher Ceramic Tiles");

const loadCmd = new Command();

loadCmd
	.name("load")
	.description("Load a Ceramic Tile by ID")
	.argument("<id>", "Tile Stream ID that will be updated")
	//  .argument('<deploypath>', 'Path to Deployed Model file that will replaced with the updated version')
	.option("-c, --commits", "Show all commits for the Stream")
	.option("-k, --key <string>", "DID Key")
	.action(async (id, options) => {
		const ceramic = await getCeramic(options.key);
		const doc = await TileDocument.load(ceramic, id);
		console.log(chalk.green(`Stream ${doc.id.toString()} loaded:`));
		if (options.commits) {
			console.log(
				util.inspect(
					doc.allCommitIds.map((commit) => ({
						cid: commit.cid,
						c: commit.toString(),
						url: commit.toUrl()
					})),
					false,
					null,
					true /* enable colors */
				)
			);
		} else {
			console.log(
				util.inspect(doc.content, false, null, true /* enable colors */)
			);
		}
	});

const updateSchemaCmd = new Command();

updateSchemaCmd
	.name("update-schema")
	.description("Update the Schema for a Ceramic Tile by ID")
	.argument("<id>", "Tile Stream ID that will be updated")
	.argument(
		"<schema_commit_id>",
		"Schema Stream Commit ID that will be updated"
	)
	.option("-k, --key <string>", "DID Key")
	.action(async (id, schemaCommitId, options) => {
		const ceramic = await getCeramic(options.key);
		const doc = await TileDocument.load(ceramic, id);
		await doc.update(doc.content, { schema: schemaCommitId });
		chalk.green(
			`Tile ${doc.id.toString()} has been updated to use schema ${schemaCommitId}`
		);
	});

cmd.addCommand(loadCmd);
cmd.addCommand(updateSchemaCmd);

export default cmd;
