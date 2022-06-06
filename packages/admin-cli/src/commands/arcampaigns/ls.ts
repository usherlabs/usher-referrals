import { Command } from "@oclif/core";
import { getDoc } from "@/utils/arcampaigns";

export default class ArcampaignsLs extends Command {
	static description = "List Campaign Addresses in the Stream Document";

	static examples = ["<%= config.bin %> <%= command.id %>"];

	public async run(): Promise<void> {
		const doc = await getDoc("ar_campaigns");
		// console.log(doc.content.set);
		console.log(doc);
	}
}
