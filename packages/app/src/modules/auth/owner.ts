/* eslint-disable no-underscore-dangle, no-await-in-loop */
/**
 * A class representing a single Shareable Owner authentication
 */

import { Base64 } from "js-base64";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { DID } from "dids";
import { TileLoader } from "@glazed/tile-loader";
import ono from "@jsdevtools/ono";
import { nanoid } from "nanoid/async";
import * as uint8arrays from "uint8arrays";
import uniq from "lodash/uniq";

import { ShareableOwnerModel } from "@usher/ceramic";

import { APP_DID } from "@/constants";
import { Partnership, CampaignReference, Profile } from "@/types";
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
const CERAMIC_PROFILES_KEY = "userProfiles";

class OwnerAuth extends Auth {
	protected _id: string = ""; // id of stream for content

	protected _partnerships: Partnership[] = [];

	protected _profile: {
		id: string;
		doc: TileDocument<Record<string, string>> | null;
		data: Profile | null;
	} = { id: "", doc: null, data: null };

	protected loader: TileLoader;

	protected _authorities: string[] = [];

	constructor() {
		super(ShareableOwnerModel);
		this.loader = new TileLoader({ ceramic: this._ceramic });
	}

	public get id() {
		return this._id;
	}

	public get authorities() {
		return this._authorities;
	}

	public get partnerships() {
		return this._partnerships;
	}

	public get profile() {
		return this._profile.data;
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

		console.log(`Connected Owner Doc`, ownerDocId, ownerDoc.content);

		const { owner } = ownerDoc.content as ShareableOwner;
		const secret = await OwnerAuth.decodeSecret(did, owner.secret);

		await this.authenticate(owner.id, secret);

		this._id = ownerDocId;

		this._authorities = owner.dids;

		return ownerDocId;
	}

	// Load the Partnerships Stream
	public async loadPartnerships(): Promise<Partnership[]> {
		console.log("load partnerships");
		const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (!setObj) {
			return [];
		}
		const { set } = setObj as SetObject;
		const streams = await Promise.all(
			set.map((id) => this.loader.load<CampaignReference>(id))
		);
		console.log("partnerships", streams);

		const partnerships = streams.map((stream) => ({
			id: stream.id.toString(),
			campaign: stream.content
		}));
		this._partnerships = partnerships;

		return this._partnerships;
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
	public async addPartnership(
		campaign: CampaignReference
	): Promise<Partnership[]> {
		// Check if Partnership already exists
		if (
			this.partnerships.find(
				({ campaign: c }) =>
					c.chain === campaign.chain && c.address === campaign.address
			)
		) {
			throw ono("Partnership already exists", campaign);
		}

		console.log(`Creating Partnership...`);
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

		console.log(`Partership created with stream id`, doc.id.toString());

		let set: string[] = [];
		const setObj = await this.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (setObj) {
			set = (setObj as SetObject).set;
		}

		set.push(doc.id.toString());

		await this.store.set(CERAMIC_PARTNERSHIPS_KEY, { set });

		console.log(`Partership added to DID set`, { set });

		this._partnerships = [
			...this._partnerships,
			{
				id: doc.id.toString(),
				campaign
			}
		];

		return this._partnerships;
	}

	/**
	 * Load the first profile is the set of profiles
	 */
	public async loadProfile() {
		const setObj = await this.store.get(CERAMIC_PROFILES_KEY);
		if (!setObj) {
			return;
		}
		const { set = [] } = setObj as SetObject;
		if (set.length === 0) {
			return;
		}
		const doc = await this.loader.load<Profile>(set[0]);
		const profileData: Profile = {
			email: ""
		};
		const entries = await Promise.all(
			Object.entries(doc.content).map(async ([key, value]) => {
				let v = new Uint8Array();
				try {
					const jwe = JSON.parse(Base64.decode(value));
					const dec = await this.did.decryptJWE(jwe);
					v = dec;
				} catch (e) {
					// ...
				}
				return {
					key,
					value: v
				};
			})
		);
		entries.forEach(({ key, value }) => {
			if (key === "email") {
				profileData[key] = uint8arrays.toString(value);
			}
		});

		this._profile = {
			id: set[0],
			// @ts-ignore
			doc,
			data: profileData
		};
	}

	/**
	 * Update the loaded profile
	 */
	public async updateProfile(newProfile: Profile) {
		const currentProfile = this.profile || {};
		const profile = {
			...currentProfile,
			...newProfile
		};
		const entries = await Promise.all(
			Object.entries(profile).map(async ([key, value]) => {
				const jwe = await this.did.createJWE(uint8arrays.fromString(value), [
					this.did.id,
					APP_DID // Share with App
				]);
				const res = Base64.encode(JSON.stringify(jwe));
				return {
					key,
					value: res
				};
			})
		);
		const encProfiles: Record<string, string> = {};
		entries.forEach(({ key, value }) => {
			encProfiles[key] = value;
		});

		if (this._profile.doc === null) {
			const doc = await TileDocument.create(
				// @ts-ignore
				this._ceramic,
				encProfiles,
				{
					schema: this.model.getSchemaURL("userProfile")
				},
				{
					pin: true
				}
			);
			const id = doc.id.toString();
			await this.store.set(CERAMIC_PROFILES_KEY, { set: [id] });

			this._profile = {
				id,
				doc,
				data: doc.content as Profile
			};
		} else {
			await this._profile.doc.update(profile);
			this._profile.data = this._profile.doc.content as Profile;
		}
	}

	public loadDoc(streamId: string) {
		return this.loader.load(streamId);
	}

	public loadOwnerDoc() {
		return this.loadDoc(this.id);
	}

	/**
	 * Merge owner into this owner
	 *
	 * * Currently only supports merging Index Records that confirm to the Set.json schema
	 *
	 * @param   {DID}  authority  A (Wallet) DID (authority) that manages this owner
	 * @param   {OwnerAuth}  mergingOwner  Owner to be merged
	 * // @param   {DID}  mergingAuthority  A (Wallet) DID (authority) that manages the owner to be merged
	 *
	 * @return  {Promise<void>}
	 */
	public async merge(
		authority: DID,
		mergingOwner: OwnerAuth
		// mergingAuthority: DID
	): Promise<void> {
		const iterator = mergingOwner.iterateIndex();
		let isDone = false;
		const setIndex: Record<string, string[]> = {};

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

		// Merge the sets into the owner sets
		// The keys between sets should be the same -- as they reference the same definition streams
		const ownerIndex = await this.getIndex();
		await Promise.all(
			Object.entries(setIndex).map(async ([key, set]) => {
				if (ownerIndex[key]) {
					const doc = await this.loadDoc(ownerIndex[key]);
					const content = doc.content as { set: string[] };
					await doc.update(uniq([...content.set, ...set]));
				} else {
					// In the circumstance where the key doesn't exist in the owner -- ie. it needs to be created
					await this.store.setRecord(key, {
						set
					});
				}

				// Remove/Unpin all records on mergingOwner
				const removingRecordId = await mergingOwner.getRecordId(key);
				const doc = await mergingOwner.loadDoc(removingRecordId);
				await doc.update({ set: [] }, undefined, { pin: false });
				await mergingOwner.removeRecord(key);
			})
		);

		const shareableOwnerDoc = await mergingOwner.loadOwnerDoc();
		const shareableOwnerDocContent =
			shareableOwnerDoc.content as ShareableOwner;

		// Decrypt the secret and re-encrypt with new did recipients
		const ownerDoc = await this.loadOwnerDoc();
		const ownerDocContent = ownerDoc.content as ShareableOwner;
		const secret = await OwnerAuth.decodeSecret(
			authority,
			ownerDocContent.owner.secret
		);
		const newOwnerDids = uniq([
			...ownerDocContent.owner.dids,
			...shareableOwnerDocContent.owner.dids
		]);
		const newSecret = await OwnerAuth.encodeSecret(
			authority,
			secret,
			newOwnerDids
		);
		await ownerDoc.update({
			owner: {
				dids: newOwnerDids,
				id: ownerDocContent.owner.id,
				secret: newSecret
			}
		});

		// Set the migrate_to value on mergingOwner ShareableOwner Stream
		await shareableOwnerDoc.update({ migrate_to: this.id });
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
		const sec = await nanoid(32);
		const id = await nanoid(64);

		const secret = uint8arrays.fromString(sec);

		await this.authenticate(id, secret);

		// Encrypt keys and store
		const enc = await OwnerAuth.encodeSecret(
			auth.did,
			uint8arrays.fromString(sec)
		);
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

		await auth.setShareableOwnerId(ownerId);

		this._id = ownerId;

		this._authorities = (doc.content as ShareableOwner).owner.dids;

		console.log(`Created Owner Doc`, ownerId, doc.content);

		return ownerId;
	}

	public static async decodeSecret(did: DID, data: string) {
		const decoded = Base64.decode(data);
		const jwe = JSON.parse(decoded);
		const secret = await did.decryptJWE(jwe);
		return secret;
	}

	public static async encodeSecret(
		did: DID,
		data: Uint8Array,
		recipients?: string[]
	) {
		const jwe = await did.createJWE(data, recipients || [did.id]);
		const str = JSON.stringify(jwe);
		const enc = Base64.encode(str);
		return enc;
	}

	public static encodeSecretFromString(
		did: DID,
		data: string,
		recipients?: string[]
	) {
		const buf = uint8arrays.fromString(data);
		return this.encodeSecret(did, buf, recipients);
	}
}

export default OwnerAuth;
