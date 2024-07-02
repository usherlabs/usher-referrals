import camelcaseKeys from "camelcase-keys";
import { z } from "zod";

// TODO: Review zod schema for Campaign Details
export const campaignDetailsDocSchema = z.object({
	destinationUrl: z.string().url(),
	name: z.string(),
	description: z.string().optional(),
	image: z.string().url().optional(),
	externalLink: z.string().url().optional(),
});

export type CampaignDetailsDoc = z.infer<typeof campaignDetailsDocSchema>;

export const campaignDetailsDocTemplate = {
	name: "<string>",
	description: "<string>",
	destination_url: "<url>",
	external_link: "<url>",
	image: "<url>",
};

export const parseCampaignDetails = (str: string) => {
	const json = JSON.parse(str);
	const obj = camelcaseKeys(json, { deep: true });

	return campaignDetailsDocSchema.parse(obj);
};
