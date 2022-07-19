/**
 * Here is where we integrate all third-party (non-integral) services.
 */

import { events, AppEvents } from "@/utils/events";
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

// ? The Reseller Conversion is not meant to be integrated here... the future Attribution is though.
// events.on(
// 	AppEvents.REWARDS_CLAIM,
// 	async ({ claim, newFunds }: { claim: Claim; newFunds: number }) => {
// 		if (identifiedUser) {
// 			// execute usher.js campaigns.
// 			const owner = Authenticate.getInstance().getOwner();
// 			if (owner) {
// 				const did = owner.did.id;
// 				Usher("convert", {
// 					id: process.env.NEXT_PUBLIC_USHER_ARWEAVE_RESELLER_CAMPAIGN_ID,
// 					chain: "arweave",
// 					staging: true,
// 					eventId: 0,
// 					nativeId: did, // for each unique owner
// 					commit: 1, // limit of 10
// 					metadata: {
// 						newFunds,
// 						amount: 0.5 * claim.fee // 50% of the fee that we capture.
// 					}
// 				});
// 			}
// 		}
// 	}
// );

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
