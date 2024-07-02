import { advertiserDocTemplate } from "@usher.so/campaigns";
import { Command } from "commander";

export const templateCommand = new Command()
	.name("template")
	.description("Genearate an Advertiser template in a JSON fromat")
	.action(async () => {
		console.log(JSON.stringify(advertiserDocTemplate, null, 2));
	});
