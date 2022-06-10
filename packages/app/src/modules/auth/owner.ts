/* eslint-disable no-underscore-dangle, no-await-in-loop */
/**
 * A class representing a single Shareable Owner authentication
 */

import { Base64 } from "js-base64";
import { TileDocument, TileMetadataArgs } from "@ceramicnetwork/stream-tile";
import { DID } from "dids";
import { TileLoader } from "@glazed/tile-loader";
import ono from "@jsdevtools/ono";
import { Sha256 } from "@aws-crypto/sha256-js";
import { nanoid } from "nanoid/async";
import uint8arrays from "uint8arrays";

import { ShareableOwnerModel } from "@usher/ceramic";

import { Partnership, CampaignReference } from "@/types";
import Auth from "./auth";
import WalletAuth from "./wallet";

type ShareableOwner = {
	owner: {
		dids: string[];
		id: string;
		secret: string;
	};
	migrate_to?: string;
};

type SetObject = {
	set: string[];
};

const CERAMIC_PARTNERSHIPS_KEY = "partnerships";
const CERAMIC_PROFILES_KEY = "profiles";

class OwnerAuth extends Auth {
	protected _id: string = ""; // id of stream for content

	protected _partnerships: Partnership[] = [];

	protected loader: TileLoader;

	constructor() {
		super(ShareableOwnerModel);
		this.loader = new TileLoader({ ceramic: this._ceramic });
	}

	public get id() {
		return this._id;
	}

	public get partnerships() {
		return this._partnerships;
	}

	/**
	 * Iterates over ShareableOwner Streams until it reachs an owner
	 * Then authenticates
	 * Returns the Stream ID of the Document where Owner is used.
	 *
	 * @return  {string}  Stream ID that is considered the current owner
	 */
	public async connect(id: string, did: DID): Promise<string> {
		// Iterate over migrated owners
		let ownerDocId = id;
		let ownerDoc = null;
		while (ownerDoc === null) {
			// @ts-ignore
			const doc = await TileDocument.load(this._ceramic, ownerDocId);
			const content = doc.content as ShareableOwner;
			const migrateTo = content.migrate_to;
			if (migrateTo && migrateTo.length > 0) {
				ownerDocId = migrateTo;
			} else {
				ownerDoc = doc;
			}
		}

		this._id = ownerDocId;

		const { owner } = ownerDoc.content as ShareableOwner;
		const decoded = Base64.decode(owner.secret);
		const jwe = JSON.parse(decoded);
		const secret = await did.decryptJWE(jwe);

		await this.authenticate(owner.id, secret);

		return ownerDocId;
	}

	// Load the Partnerships Stream
	public async loadPartnerships() {
		const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (!setObj) {
			return;
		}
		const { set } = setObj as SetObject;
		const streams = await Promise.all(set.map((id) => this.loader.load(id)));

		const partnerships = streams.map(
			(stream) =>
				({
					id: stream.id.toString(),
					campaign: stream.content
				} as Partnership)
		);
		this._partnerships = partnerships;
	}

	/**
	 * Add Campaign to Partnerships and load new index
	 * 1. Creates a new partnership stream
	 * 2. Adds partnership stream to the ShareableOwner DID Data Store
	 *
	 * @param   {Partnership}  partnership  new partnership to add
	 *
	 * @return  {[type]}                    [return description]
	 */
	public async addPartnership(campaign: CampaignReference) {
		// Check if Partnership already exists
		if (
			this.partnerships.find(
				({ campaign: c }) =>
					c.chain === campaign.chain && c.address === campaign.address
			)
		) {
			throw ono("Partnership already exists", campaign);
		}

		const doc = await TileDocument.create(
			// @ts-ignore
			this._ceramic,
			campaign,
			{
				schema: this.model.getSchemaURL("partnership"),
				family: "usher:partnerships"
			},
			{
				pin: true
			}
		);

		let set: string[] = [];
		const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (setObj) {
			set = (setObj as SetObject).set;
		}

		set.push(doc.id.toString());

		await this.store.set(CERAMIC_PARTNERSHIPS_KEY, { set });

		this._partnerships.push({
			id: doc.id.toString(),
			campaign
		});
	}

	public loadDoc(streamId: string) {
		return TileDocument.load(
			// @ts-ignore
			this._ceramic,
			streamId
		);
	}

	/**
	 * Merge owner into this owner
	 *
	 * @param   {WalletAuth}  authority  A Wallet Auth (authority) that manages this owner
	 * @param   {OwnerAuth}  mergingOwner  Owner to be merged
	 * @param   {WalletAuth}  mergingAuthority  A Wallet Auth (authority) that manages the owner to be merged
	 *
	 * @return  {Promise<void>}
	 */
	public async merge(
		authority: WalletAuth,
		mergingOwner: OwnerAuth,
		mergingAuthority: WalletAuth
	): Promise<void> {
		const iterator = mergingOwner.iterateIndex();
		let isDone = false;
		const setIndex: Record<string, string[]> = [];

		while (!isDone) {
			const res = await iterator.next();
			if (res.done) {
				isDone = true;
			}
			if (res.value) {
				// If set, change all controllers to this.owner
				if (Array.isArray(res.value.record?.set)) {
					// We don't await here, because this ownership transfer can run async...
					const streamIds = res.value.record.set as string[];
					setIndex[res.value.key] = streamIds;
					Promise.all(
						streamIds.map(async (id) => {
							const doc = await mergingOwner.loadDoc(id);
							await doc.update(doc.content, {
								controllers: [this.did.id]
							});
						})
					);
				}
			}
		}

		const ownerIndex = await this.getIndex();
		await Promise.all(
			Object.entries(setIndex).map(async ([key, value]) => {
				const doc = await this.loadDoc(ownerIndex[key]);
				await doc.update([...doc.content.set, ...value]);
			})
		);
	}

	/**
	 * Create a new Owner
	 *
	 * The Merge function is going to be responsible for aggregating wallets for a single owner
	 * This method is responsible for creating an owner for a single wallet connection
	 *
	 * @return  {string}  owner id
	 */
	public async create(auth: WalletAuth): Promise<string> {
		if (this.did) {
			throw ono("Owner already created");
		}
		// Produce keys and authenticate
		const sec = await nanoid(64);
		const hash = new Sha256();
		hash.update(sec);
		const buf = await hash.digest();
		const id = uint8arrays.toString(buf);
		console.log({ id, sec });

		const secret = uint8arrays.fromString(sec);

		await this.authenticate(id, secret);

		// Encrypt keys and store
		const jwe = await auth.did.createJWE(secret, [auth.did.id]);
		const str = JSON.stringify(jwe);
		const enc = Base64.encode(str);
		const doc = await TileDocument.create(
			// @ts-ignore
			this._ceramic,
			{
				owner: {
					dids: [auth.did.id],
					id,
					secret: enc
				}
			},
			{
				schema: auth.getSchema("ShareableOwner")
			}
		);

		const ownerId = doc.id.toString();

		this._id = ownerId;

		await auth.setShareableOwnerId(ownerId);

		return ownerId;
	}
}

export default OwnerAuth;
