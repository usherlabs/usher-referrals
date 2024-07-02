import { Command } from "commander";
import { authCommand } from "./advertiser/auth.js";
import { createCommand } from "./advertiser/create.js";
import { listCommand } from "./advertiser/list.js";
import { templateCommand } from "./advertiser/template.js";

export const advertiserCommand = new Command()
	.name("advertiser")
	.description("Manage Advertiser")
	.addCommand(listCommand)
	.addCommand(authCommand)
	.addCommand(templateCommand)
	.addCommand(createCommand);
// TODO: Create a command to update an Advertiser
