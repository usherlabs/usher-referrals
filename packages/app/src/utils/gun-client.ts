/**
 * For reference, see https://github.com/DimensionDev/Maskbook/blob/develop/packages/gun-utils/src/instance.ts
 * Basically this additional logic is to maintain connections between websocket requests.
 * It's also to establish new connections when connections fail or are aborted
 */

import {
	GunSchema,
	IGunInstanceRoot,
	GunSoul,
	GunCallbackPut,
	GunOptionsPut
} from "gun";
import Gun from "gun/gun";
import { gunPeers } from "@/env-config";
import "gun/sea";
import "gun/lib/then";
// import "gun/lib/time";

// See: https://github.com/amark/gun/blob/master/types/gun/IGunChain.d.ts
// Add type for time
declare module "gun" {
	export interface IGunChain<
		TNode extends GunSchema,
		TChainParent extends
			| IGunChain<any, any, any, any>
			| IGunInstanceRoot<any, any> = any,
		TGunInstance extends IGunInstanceRoot<any, any> = any,
		TKey extends string = any
	> {
		time<
			V extends
				| (TNode extends object ? Partial<TNode> : TNode)
				| GunSoul<TNode>
				| IGunChain<TNode, any, any, any>
				| IGunChain<NonNullable<TNode>, any, any, any>
		>(
			value: V,
			callback?: GunCallbackPut,
			options?: GunOptionsPut
		): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
	}
}

export type GunRoot = ReturnType<typeof createGun> & {
	off?: () => void;
};

let gun: GunRoot | undefined;
let peers: string[] = gunPeers;

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
		peers,
		localStorage: false,
		radisk: true, // Will used IndexedDB
		WebSocket
	});
	g.opt({ retry: Number.POSITIVE_INFINITY });
	return g;
}

export async function initPeers(): Promise<string[]> {
	if (peers.length > 0) {
		return peers;
	}
	peers = [...peers];
	// peers = kyve.get()
	return peers;
}

export async function initGun(withRoot = true): Promise<Function> {
	await initPeers();

	return () => {
		if (gun) {
			return gun.get("usher");
		}
		gun = createGun();

		if (withRoot) {
			return gun.get("usher");
		}

		return gun;
	};
}

export { Gun };
