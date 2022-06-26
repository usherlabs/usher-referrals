/**
 * Here is where we integrate all third-party (non-integral) services.
 */

import { events, AppEvents } from "@/utils/events";
import { Profile } from "@/types";
import { request } from "@/api";

events.on(AppEvents.PROFILE_SAVE, async (profile: Profile) => {
	if (!profile.email) {
		return;
	}
	await request.post("marketing", {
		json: {
			email: profile.email
		}
	});
});
