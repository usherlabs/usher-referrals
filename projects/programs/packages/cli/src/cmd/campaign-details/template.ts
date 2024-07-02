import { campaignDetailsDocTemplate } from "@usher.so/campaigns";
import { Command } from "commander";

export const templateCommand = new Command()
	.name("template")
	.description("Genearate a Campaign template in a JSON fromat")
	.action(async () => {
		console.log(JSON.stringify(campaignDetailsDocTemplate, null, 2));
	});
