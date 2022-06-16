import { Command } from "commander";
import schemaCmd from "./cmd/schema";
import definitionCmd from "./cmd/definition";
import tileCmd from "./cmd/tile";

const program = new Command();

program.addCommand(schemaCmd);
program.addCommand(tileCmd);
program.addCommand(definitionCmd);

program.parse(process.argv);
