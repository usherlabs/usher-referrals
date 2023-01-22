export {};
// import { Api } from "@usher.so/shared";
// import { Link } from "./types";

// export class LinksApi extends Api {
// 	public relatedLinks(authToken: string) {
// 		const req = this.getAuthRequest(authToken);

// 		return {
// 			async get() {
// 				const resp = await req.get(`collections`).json();
// 				return resp as { success: boolean; data: Link[] };
// 			},
// 			async post(link: Link): Promise<{ success: boolean }> {
// 				return req
// 					.post(`collections`, {
// 						json: {
// 							link
// 						}
// 					})
// 					.json();
// 			}
// 		};
// 	}
// }
