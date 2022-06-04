import isEmpty from "lodash/isEmpty";
import urlJoin from "url-join";
import { inviteOrigin } from "@/env-config";

const getInviteLink = (id = "") => {
	let origin = `${window.location.origin}/inv`;
	if (!isEmpty(inviteOrigin)) {
		origin = inviteOrigin as string;
	}
	return urlJoin(origin, id);
};

export default getInviteLink;
