import chalk from "chalk";
import { DataModel } from "@glazed/datamodel";
import NetworkModel from "@usher/ceramic/models/Network.json";
import { getCeramic } from "@/utils/manager";

export const getDoc = async (alias: string) => {
	const ceramic = await getCeramic();
	const model = new DataModel({ ceramic, aliases: NetworkModel });
	// @ts-ignore
	const doc = await model.loadTile(alias);
	if (!doc) {
		console.log(chalk.red(`Cannot load the ArNetwork Campaigns Stream!`));
		process.exit(1);
	}
	return doc;
};
