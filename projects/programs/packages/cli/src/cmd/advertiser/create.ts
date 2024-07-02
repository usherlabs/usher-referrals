import { Campaigns, parseAdvertiserDoc } from "@usher.so/campaigns";
import { ApiOptions } from "@usher.so/shared";
import { Command, Option } from "commander";
import { getContentByOptions } from "../../utils/content.js";
import { parseDID } from "../../utils/did.js";
import { addAdvertiser } from "../../utils/storage.js";

// TODO: Review the ordger of the options
export const createCommand = new Command()
	.name("create")
	.description("Creeate a new Advertiser stream on Ceramic")
	.requiredOption(
		"--ceramic <string>",
		"Ceramic API URL",
		ApiOptions.default.ceramicUrl
	)
	.requiredOption("-k, --key <string>", "DID Private Key")
	.addOption(
		new Option(
			"--file <string>",
			"Path to Advertiser file in a JSON format"
		).conflicts("content")
	)
	.addOption(
		new Option(
			"--content <string>",
			"Advertiser content in a JSON format"
		).conflicts("file")
	)
	.action(async (options) => {
		const { ceramic: ceramicUrl, key } = options;
		const content = getContentByOptions(options);

		const did = parseDID(key);
		await did.authenticate();

		const advertiser = parseAdvertiserDoc(content);

		const campaignsProvider = new Campaigns({ ceramicUrl });
		const tile = await campaignsProvider.createAdvertiser(advertiser, did);

		addAdvertiser({
			name: advertiser.name,
			streamId: tile.id.toString(),
		});

		console.log(`Advertiser Profile Doc created!`);
		console.log({
			streamID: tile.id.toString(),
			content: tile.content,
		});
	});
