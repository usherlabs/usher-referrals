/**
 * Here is where we integrate all third-party (non-integral) services.
 */

import { AppEvents, events } from "@/utils/events";
import { Profile, User } from "@/types";
import { request } from "@/api";

import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
// import Authenticate from "@/modules/auth";

// let identifiedUser: User | null = null;
// const usher = Usher({ staging: true });
// const arResellerCampaignId =
// 	process.env.NEXT_PUBLIC_USHER_ARWEAVE_RESELLER_CAMPAIGN_ID || "";

events.on(AppEvents.PROFILE_SAVE, async ({ profile }: { profile: Profile }) => {
	if (!profile.email) {
		return;
	}
	await request.post("marketing", {
		json: {
			email: profile.email
		}
	});
});

events.on(AppEvents.SAVE_USER, ({ user }: { user: User }) => {
	// identifiedUser = user;
	setErrorTrackingUser(user);
	identifyUser(
		user.profile.email ||
			user.wallets.map((w) => [w.chain, w.address].join(":")).join("|"),
		user
	);
});

// events.on(AppEvents.START_PARTNERSHIP, async () => {});
