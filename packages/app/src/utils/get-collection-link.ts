import isEmpty from "lodash/isEmpty";
import urlJoin from "url-join";

import { collectionOrigin } from "@/env-config";

export const getCollectionLink = (id = "") => {
	let origin = `${window.location.origin}/link`;
	if (!isEmpty(collectionOrigin)) {
		origin = collectionOrigin as string;
	}
	return urlJoin(origin, id);
};
