/**
 * Here is where we integrate all third-party (non-integral) services.
 */

import { events, AppEvents } from "@/utils/events";
import {
	Profile,
	User
	// Claim
} from "@/types";
import { request } from "@/api";
// import { Usher } from "@usher.so/js";

import { setUser as setErrorTrackingUser } from "@/utils/handle-exception";
import { identifyUser } from "@/utils/signals";
// import Authenticate from "@/modules/auth";

// let identifiedUser: User | null = null;

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

// events.on(
// 	AppEvents.REWARDS_CLAIM,
// 	async ({ claim, newFunds }: { claim: Claim; newFunds: number }) => {
// 		if (identifiedUser) {
// 			// execute usher.js campaigns.
// 			const owner = Authenticate.getInstance().getOwner();
// 			if (owner) {
// 				const did = owner.did.id;
// 				Usher("convert", {
// 					id: "", // TODO: Add Campaign ID
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
	// identifiedUser = saved;
	setErrorTrackingUser(user);
	identifyUser(
		user.profile.email ||
			user.wallets.map((w) => [w.chain, w.address].join(":")).join("|"),
		user
	);
});

// events.on(AppEvents.START_PARTNERSHIP, async () => {});
