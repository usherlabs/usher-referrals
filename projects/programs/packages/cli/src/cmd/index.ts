import { program } from "commander";
import { handleError } from "../utils/error.js";
import { advertiserCommand } from "./advertiser.js";
import { campaignDetailsCommand } from "./campaign-details.js";
import { campaignCommand } from "./campaign.js";

process.on("uncaughtException", handleError);

program.addCommand(advertiserCommand);
program.addCommand(campaignDetailsCommand);
program.addCommand(campaignCommand);

program.name("Usher CLI").version("0.0.1", "-v, --version");

program.parse(process.argv);
