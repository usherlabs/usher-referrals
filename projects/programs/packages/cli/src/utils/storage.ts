import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

type Advertiser = {
	name: string;
	streamId: string;
};

type CampaignDetails = {
	name: string;
	streamId: string;
};

type Storage = {
	advertisers: Advertiser[];
	campaignDetails: CampaignDetails[];
};

const usherHome = path.join(os.homedir(), ".usher");
const usherConfigFile = path.join(usherHome, "config.json");

async function read(): Promise<Storage> {
	try {
		const str = readFileSync(usherConfigFile, { encoding: "utf8" });
		return JSON.parse(str) as Storage;
	} catch {
		return {
			advertisers: [],
			campaignDetails: [],
		} as Storage;
	}
}

async function write(storage: Storage) {
	if (!existsSync(usherHome)) {
		await mkdirSync(usherHome);
	}

	writeFileSync(usherConfigFile, JSON.stringify(storage, null, 2));
}

export async function getAdvertisers(): Promise<Advertiser[]> {
	const storage = await read();
	return storage.advertisers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addAdvertiser(advertiser: Advertiser) {
	const storage = await read();
	storage.advertisers.push(advertiser);
	await write(storage);
}

export async function getCampaignDetails(): Promise<CampaignDetails[]> {
	const storage = await read();
	return storage.campaignDetails.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCampaignDetails(campaignDetails: CampaignDetails) {
	const storage = await read();
	storage.campaignDetails.push(campaignDetails);
	await write(storage);
}
