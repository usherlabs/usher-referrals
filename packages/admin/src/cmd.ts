import { Command } from "commander";
import schemaCmd from "./cmd/schema";
import definitionCmd from "./cmd/definition";
import tileCmd from "./cmd/tile";
import arweaveCmd from "./cmd/arweave";
import didCmd from "./cmd/did";
import appCmd from "./cmd/app";

const program = new Command();

program.addCommand(schemaCmd);
program.addCommand(tileCmd);
program.addCommand(definitionCmd);
program.addCommand(arweaveCmd);
program.addCommand(appCmd);
program.addCommand(didCmd);

program.parse(process.argv);
