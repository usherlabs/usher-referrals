// import { getAppDID } from "@/server/did"; // TODO: Solve bug where 'dids' module cannot be found...

// const message =
// 	"812389.k1dpgaqe3i64kjrk893r4nhoi2r8kwu0cpwlelbu0it0vc9d3h51yw18kgtkzepn3trapgsx7bjqmnlju1frs1emch7wal8e90dngxctlub8voophnsh193ik";

// describe("App DID Test", () => {
// 	it("Can verify a signature", async () => {
// 		const did = await getAppDID();

// 		const jws = await did.createJWS(message);
// 		const promise = did.verifyJWS(jws, { issuer: did.id });

// 		expect(async () => {
// 			const result = await promise;
// 			expect(result.kid).toBeTruthy();
// 		}).not.toThrow();
// 	});
// });
