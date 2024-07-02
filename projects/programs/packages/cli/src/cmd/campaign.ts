import { Command } from "commander";
import { createCommand } from "./campaign/create.js";
import { indexCommand } from "./campaign/index.js";
import { templateCommand } from "./campaign/template.js";

export const campaignCommand = new Command()
	.name("campaign")
	.description("Manage Campaigns")
	.addCommand(templateCommand)
	.addCommand(createCommand)
	.addCommand(indexCommand);
