/**
 * For reference, see https://github.com/DimensionDev/Maskbook/blob/develop/packages/gun-utils/src/instance.ts
 * Basically this additional logic is to maintain connections between websocket requests.
 * It's also to establish new connections when connections fail or are aborted
 */

import {
	IGun,
	IGunChain,
	GunSchema,
	IGunInstanceRoot,
	GunSoul,
	GunCallbackPut,
	GunOptionsPut
} from "gun";
import Gun from "gun/gun";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";
import "gun/sea";
import { gunPeers } from "@/env-config";

// See: https://github.com/amark/gun/blob/master/types/gun/IGunChain.d.ts
// Add type for then and time
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

		then<D>(): Promise<[D, string]>;
	}
}

// Replacment for .once -- return a promise for the data
Gun.chain.then = function gunThen() {
	const gun = this;
	return new Promise((res) => {
		gun.once((data, key) => {
			res([data, key]);
		});
	});
};

export type GunRoot = ReturnType<typeof createGun> & {
	off?: () => void;
};

let gun: GunRoot | undefined;
let peers: string[] = gunPeers;

export const OnCloseEvent = new Set<Function>();

function createGun() {
	// class WebSocket extends globalThis.WebSocket {
	// 	private declare abort: () => void;

	// 	private declare keepAlive: () => void;

	// 	declare timer: NodeJS.Timer | undefined;

	// 	constructor(url: string | URL) {
	// 		super(url);
	// 		this.abort = () => {
	// 			if (gun && gun?.off) {
	// 				gun.off();
	// 			}
	// 			gun = undefined;
	// 			this.close();
	// 			OnCloseEvent.forEach((each) => {
	// 				each();
	// 			});
	// 			// eslint-disable-next-line
	// 			console.log(
	// 				"[Network/gun] WebSocket of the Gun instance is killed due to inactive."
	// 			);
	// 		};
	// 		const { abort } = this;
	// 		this.keepAlive = () => {
	// 			if (this.timer) {
	// 				clearTimeout(this.timer);
	// 			}
	// 			this.timer = setTimeout(abort, 3 * 60 * 1000);
	// 		};
	// 		const { keepAlive } = this;
	// 		this.addEventListener(
	// 			"message",
	// 			(e) => {
	// 				// if there is no meaningful data exchange, then do not keep the connection alive.
	// 				if (typeof e.data === "string" && e.data.length < 3) return;
	// 				keepAlive();
	// 			},
	// 			{}
	// 		);
	// 	}

	// 	override send(data: any) {
	// 		this.keepAlive();
	// 		super.send(data);
	// 	}

	// 	// override get onclose() {
	// 	// 	return null;
	// 	// }

	// 	// override set onclose(f) {}
	// }

	const g = new Gun({
		peers,
		// localStorage: false,
		// radisk: true, // Will used IndexedDB
		// WebSocket,
		axe: false
	});
	g.opt({ retry: Number.POSITIVE_INFINITY });
	return g;
}

async function initPeers(): Promise<string[]> {
	if (peers.length > 0) {
		return peers;
	}
	peers = [...peers];
	// peers = kyve.get()
	return peers;
}

async function initGun() {
	await initPeers();
	try {
		/* @ts-ignore */
		await import("gun/lib/time");
	} catch (e) {
		console.error(e);
	}
}

export async function connectGunBase(): Promise<[GunRoot, IGun]> {
	await initGun();

	if (!gun) {
		gun = createGun();
	}

	return [gun, Gun];
}

export async function connectGun(): Promise<[IGunChain<any>, IGun]> {
	const [gunV, GunV] = await connectGunBase();

	return [gunV.get("usher"), GunV];
}
