import { Chains } from "@usher.so/shared";
import camelcaseKeys from "camelcase-keys";
import { z } from "zod";
import { CampaignStrategies, RewardTypes } from "../types.js";

// TODO: Review zod schema for Campaign
export const campaignDocSchema = z.object({
	id: z.string().optional(),
	chain: z.nativeEnum(Chains),
	disableVerification: z.boolean().optional(),
	owner: z.string().optional(),
	events: z.array(
		z.object({
			strategy: z.nativeEnum(CampaignStrategies),
			rate: z.number(),
			nativeLimit: z.number().optional(),
			perCommit: z.number().optional(),
			description: z.string().optional(),
			contractAddress: z.string().optional(),
			contractEvent: z.string().optional(),
		})
	),
	reward: z.object({
		name: z.string(),
		ticker: z.string(),
		type: z.nativeEnum(RewardTypes),
		address: z.string().optional(),
	}),
	details: z.string(),
	advertiser: z.string(),
});

export type CampaignDoc = z.infer<typeof campaignDocSchema>;

export const campaignDocTemplate = {
	chain: Object.values(Chains).join("|"),
	disable_verification: "true|false",
	events: [
		{
			strategy: Object.values(CampaignStrategies).join("|"),
			rate: "<number>",
			nativeLimit: "[<number>]",
			perCommit: "[<number>]",
			description: "[<string>]",
			contractAddress: "[<string>]",
			contractEvent: "[<string>]",
		},
	],
	reward: {
		name: "<string>",
		ticker: "<string>",
		type: Object.values(RewardTypes).join("|"),
		address: "[<string>]",
	},
};

export async function parseCampaignDoc(str: string): Promise<CampaignDoc> {
	const json = JSON.parse(str);
	const obj = camelcaseKeys(json, { deep: true });

	return await campaignDocSchema.parseAsync(obj);
}
