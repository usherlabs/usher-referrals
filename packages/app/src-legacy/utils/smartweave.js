import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import Arweave from "arweave";
import { isProd, isTest } from "@/env-config";

// ~~ Initialize Arweave ~~
let arConfig = {
	host: "testnet.redstone.tools",
	port: 443,
	protocol: "https"
};
if (isTest) {
	arConfig = {
		host: "localhost",
		port: 1984,
		protocol: "http"
	};
}
if (isProd) {
	arConfig = {
		host: "arweave.net",
		port: 443,
		protocol: "https"
	};
}
export const arweave = Arweave.init(arConfig);

// ~~ Initialize `LoggerFactory` ~~
LoggerFactory.INST.logLevel("error");

// ~~ Initialize SmartWeave ~~
export const smartweave = SmartWeaveNodeFactory.memCached(arweave);
