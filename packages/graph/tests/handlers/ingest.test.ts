import { expect } from "chai";
import ingestHandler from "../../src/handlers/ingest";

describe("Sample Test", () => {
	it("checking sample", async () => {
		await ingestHandler();
		console.log("done");
	});
});
