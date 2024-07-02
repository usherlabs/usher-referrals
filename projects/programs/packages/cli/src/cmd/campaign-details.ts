import { Command } from "commander";
import { createCommand } from "./campaign-details/create.js";
import { listCommand } from "./campaign-details/list.js";
import { templateCommand } from "./campaign-details/template.js";

export const campaignDetailsCommand = new Command()
	.name("campaign-details")
	.description("Manage Campaign Details")
	.addCommand(listCommand)
	.addCommand(templateCommand)
	.addCommand(createCommand);
// TODO: Create a command to update a Campaign
