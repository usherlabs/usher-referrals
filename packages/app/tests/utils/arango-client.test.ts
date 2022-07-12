// import { aql } from "arangojs";
// import { getArangoClient } from "@/utils/arango-client";

// const arango = getArangoClient();

// describe("Arango Client Test", () => {
// 	it("Connects to the Database", async () => {
// 		const cursor = await arango.query(aql`
// 			FOR c IN Campaigns
// 				RETURN c
// 		`);
// 		let count = 0;
// 		for await (const res of cursor) {
// 			console.log(res);
// 			count += 1;
// 		}
// 		expect(count).toBeGreaterThan(0);
// 	});
// });
