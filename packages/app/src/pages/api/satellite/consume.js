/**
 * POST: Add authorised user to the Discord Server / Guide.
 * GET: Fetch an Invite link to the Discord Server Channel -- Also add a record of the invitee
 *
 * Both Invitees and Ushers are going to use the same Auth
 */

import cors from "cors";
import getHandler from "@/server/middleware";
// import { supabase } from "@/utils/supabase-client";

const handler = getHandler();

// Initializing the cors middleware
handler.use(cors()).post(async (req, res) => {
	console.log(req.body);
	return res.json({
		success: false
	});
});

export default handler;
