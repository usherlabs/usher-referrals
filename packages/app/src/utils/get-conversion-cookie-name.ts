import { Base64 } from "js-base64";

import { Chains } from "@/types";
import { CONVERSION_COOKIE_NAME } from "@/constants";

export default (id: string, chain: Chains) => {
	const enc = Base64.encodeURI([chain, id].join(":"));
	const cookieName = [CONVERSION_COOKIE_NAME, enc].join("_");
	return cookieName;
};
