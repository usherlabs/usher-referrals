import ono from "@jsdevtools/ono";
import { Campaigns } from "@usher.so/campaigns";
import { ApiOptions } from "@usher.so/shared";
import { Argument, Command } from "commander";

export const indexCommand = new Command()
	.name("index")
	.description("Index Arweave transaction as a Campaign on Usher")
	.option("--usher <string>", "Usher API URL", ApiOptions.default.usherUrl)
	.addArgument(new Argument("id <string>", "Arweave Transaction ID"))
	.action(async (id, options) => {
		const { usher: usherUrl } = options;
		const campaignsProvider = new Campaigns({ usherUrl });
		console.log(`Indexing campaign with origin ${id} on Usher...`);
		try {
			console.log(id);
			const response = await campaignsProvider.indexCampaign(id);
			console.log("Indexed successfully!");
			console.log(JSON.stringify(response.campaign, null, 2));
		} catch (e) {
			throw ono("Cannot index Campaign in Usher", e);
		}
	});
