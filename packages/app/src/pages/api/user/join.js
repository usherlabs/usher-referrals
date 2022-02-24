/**
 * Endpoint to manage token retrieval.
 * Only token at the moment is Twilio Connection Token
 */

// import pick from "lodash/pick";

// import { publicUrl } from "@/env-config";
// import * as routes from "@/routes";
// import getHandler, { onNoMatch } from "@/server/middleware";
import getHandler, { onNoMatch } from "@/server/middleware";
// import * as authManager from "@/server/auth-manager";

const handler = getHandler();

handler.post(async (req, res) => {
	console.log(req.token);
	//  const { id: username } = req.query;

	//  const viewUser = await authManager.getUserByUsername(username);

	//  const publicViewUser = {
	// 	 ...pick(viewUser, [
	// 		 "picture",
	// 		 "givenName",
	// 		 "country",
	// 		 "currency",
	// 		 "gender",
	// 		 "hourlyRate",
	// 		 "isLive",
	// 		 "messageBroadcast",
	// 		 "purpose",
	// 		 "username",
	// 		 "roles"
	// 	 ]),
	// 	 isAvailable: viewUser.isLive && !isEmpty(viewUser.callSession),
	// 	 url: `${publicUrl}${routes.build.user(viewUser.username)}`
	//  };

	//  if (isEmpty(viewUser)) {
	// 	 return onNoMatch(req, res);
	//  }

	return res.json({
		success: true
	});
});

export default handler;
