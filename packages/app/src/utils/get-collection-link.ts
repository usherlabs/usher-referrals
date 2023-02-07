import isEmpty from "lodash/isEmpty";
import urlJoin from "url-join";

import { collectionOrigin } from "@/env-config";

export const getCollectionLink = (
	id = "",
	options?: {
		removeProto: boolean;
	}
) => {
	let origin = `${window.location.origin}/link`;
	if (!isEmpty(collectionOrigin)) {
		origin = collectionOrigin as string;
	}
	let url = urlJoin(origin, id);

	if (options?.removeProto) {
		url = url.replace(/^https?:\/\//, "");
	}
	return url;
};
