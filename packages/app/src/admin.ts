/**
 * An Admin ONLY File used for managing Auth Instance from within the Browser.
 */

import Authenticate from "@/modules/auth";

const authInstance = Authenticate.getInstance();

export const UsherAdmin = {
	auth() {
		return authInstance;
	},
	async destroyOwner() {
		const auths = authInstance.getAll();
		await Promise.all(auths.map((auth) => auth.setShareableOwnerId("")));
		console.log(
			"Auth Owner IDs have been Reset!",
			await Promise.all(auths.map((auth) => auth.getShareableOwnerId()))
		);
	}
};

if (typeof window !== "undefined") {
	// @ts-ignore
	window.UsherAdmin = UsherAdmin;
}
