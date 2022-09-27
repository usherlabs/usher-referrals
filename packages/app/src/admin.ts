/**
 * An Admin ONLY File used for managing Auth Instance from within the Browser.
 */

import Authenticate from "@/modules/auth";

const authInstance = Authenticate.getInstance();

export const UsherAdmin = {
	auth() {
		return authInstance;
	}
};

if (typeof window !== "undefined") {
	// @ts-ignore
	window.UsherAdmin = UsherAdmin;
}
