import { Command } from "commander";
import { getCampaignDetails } from "../../utils/storage.js";

export const listCommand = new Command()
	.name("list")
	.description("List Campaign Details")
	.action(async () => {
		const campaignDetails = await getCampaignDetails();
		campaignDetails.forEach((campaignDetail) =>
			console.log(`${campaignDetail.streamId} - ${campaignDetail.name}`)
		);
	});
