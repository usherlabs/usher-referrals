import { Command } from "commander";
import { getAdvertisers } from "../../utils/storage.js";

export const listCommand = new Command()
	.name("list")
	.description("List Advertisers")
	.action(async () => {
		const advertisers = await getAdvertisers();
		advertisers.forEach((advertiser) =>
			console.log(`${advertiser.streamId} - ${advertiser.name}`)
		);
	});
