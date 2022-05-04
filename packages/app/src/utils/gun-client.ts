/**
 * For reference, see https://github.com/DimensionDev/Maskbook/blob/develop/packages/gun-utils/src/instance.ts
 * Basically this additional logic is to maintain connections between websocket requests.
 * It's also to establish new connections when connections fail or are aborted
 */

import Gun from "gun/gun";
import { gunPeers } from "@/env-config";
import "gun/lib/then";

if (gunPeers.length === 0) {
	throw new Error("No Gun Peers passed to environment!");
}

export type GunRoot = ReturnType<typeof createGun> & {
	off?: () => void;
};

let gun: GunRoot | undefined;

export const OnCloseEvent = new Set<Function>();

function createGun() {
	class WebSocket extends globalThis.WebSocket {
		private declare abort: () => void;

		private declare keepAlive: () => void;

		declare timer: NodeJS.Timer | undefined;

		constructor(url: string | URL) {
			super(url);
			this.abort = () => {
				if (gun && gun?.off) {
					gun.off();
				}
				gun = undefined;
				this.close();
				OnCloseEvent.forEach((each) => {
					each();
				});
				// eslint-disable-next-line
				console.log(
					"[Network/gun] WebSocket of the Gun instance is killed due to inactive."
				);
			};
			const { abort } = this;
			this.keepAlive = () => {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.timer = setTimeout(abort, 3 * 60 * 1000);
			};
			const { keepAlive } = this;
			this.addEventListener(
				"message",
				(e) => {
					// if there is no meaningful data exchange, then do not keep the connection alive.
					if (typeof e.data === "string" && e.data.length < 3) return;
					keepAlive();
				},
				{}
			);
		}

		override send(data: any) {
			this.keepAlive();
			super.send(data);
		}

		// override get onclose() {
		// 	return null;
		// }

		// override set onclose(f) {}
	}

	const g = new Gun({
		peers: [...gunPeers],
		localStorage: false,
		radisk: true, // Will used IndexedDB
		WebSocket
	});
	g.opt({ retry: Number.POSITIVE_INFINITY });
	return g;
}

export function getGunInstance(): GunRoot {
	if (gun) {
		return gun;
	}
	gun = createGun();
	return gun;
}
