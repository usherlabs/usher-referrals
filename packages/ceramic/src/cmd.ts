import { Command } from "commander";
import arCampaignsCmd from "./cmd/arcampaigns";

const program = new Command();

program.addCommand(arCampaignsCmd);

program.parse(process.argv);
