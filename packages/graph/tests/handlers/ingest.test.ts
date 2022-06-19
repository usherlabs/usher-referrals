// import { CeramicClient } from "@ceramicnetwork/http-client";
// import { DataModel } from "@glazed/datamodel";
import { expect } from "chai";
import ingestHandler from "../../src/handlers/ingest";

describe("Sample Test", () => {
	it("checking sample", async () => {
		// console.log(DataModel);
		await ingestHandler();
		expect(false).to.be.false;
		console.log("done");
	});
});
