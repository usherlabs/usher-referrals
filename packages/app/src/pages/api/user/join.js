/**
 * Endpoint to add authorised user to the Discord Server.
 */

// import { publicUrl } from "@/env-config";
// import * as routes from "@/routes";
import getHandler, { onNoMatch } from "@/server/middleware";
// import {supabase} from '@/utils/supabase-client';
import auth from "@/server/middleware/auth";

const handler = getHandler();

handler.use(auth).post(async (req, res) => {
	console.log(req.user);

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
