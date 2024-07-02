import { TileDocument } from "@ceramicnetwork/stream-tile";
import ono from "@jsdevtools/ono";
import { Authenticate, WalletAuth } from "@usher.so/auth";
import { ApiOptions } from "@usher.so/shared";

import { PartnershipsApi } from "./api.js";
import { CampaignReference, Partnership } from "./types.js";

const CERAMIC_PARTNERSHIPS_KEY = "partnerships";

type SetObject = {
	set: string[];
};

export class Partnerships {
	private auth: Authenticate;
	private api: PartnershipsApi;
	private partnerships: Partnership[] = [];

	constructor(auth: Authenticate, options?: ApiOptions) {
		this.auth = auth;
		this.api = new PartnershipsApi(options);
	}

	public getPartnerships() {
		return this.partnerships;
	}

	private async createPartnership(
		walletAuth: WalletAuth,
		campaignReference: CampaignReference
	) {
		const doc = await TileDocument.create(
			walletAuth.ceramic,
			campaignReference,
			{
				schema: walletAuth.getSchema("Partnership") ?? undefined,
				family: "usher:partnerships",
			},
			{
				pin: true,
			}
		);

		console.log(`Partership created with stream id`, doc.id.toString());

		let set: string[] = [];
		const setObj = await walletAuth.store.get(CERAMIC_PARTNERSHIPS_KEY);
		if (setObj) {
			set = (setObj as SetObject).set;
		}

		set.push(doc.id.toString());

		await walletAuth.store.set(CERAMIC_PARTNERSHIPS_KEY, { set });

		console.log(`Partership added to DID set`, { set });

		// ? In the future we should index the partnerships here too.

		return {
			id: doc.id.toString(),
			campaign: campaignReference,
		};
	}

	/**
	 * Add Campaign to Partnerships and load new index for the given authenticated DID that is relative to the chain of the Campaign
	 * 1. Creates a new partnership stream
	 * 2. Adds partnership stream to the DID Data Store
	 *
	 * @param   {CampaignReference}  campaignReference  new partnership to add
	 *
	 * @return  {[type]}                    [return description]
	 */
	public async addPartnership(
		campaignReference: CampaignReference
	): Promise<Partnership[]> {
		// Check if Partnership already exists
		if (
			this.partnerships.find(
				({ campaign: c }) =>
					c.chain === campaignReference.chain &&
					c.address === campaignReference.address
			)
		) {
			throw ono("Partnership already exists", campaignReference);
		}

		console.log(`Creating Partnership...`);
		const walletAuth = this.auth
			.getAll()
			.find((a) => a.wallet.chain === campaignReference.chain);
		if (!walletAuth) {
			throw ono(
				"No wallet authorised for this Campaign's chain",
				campaignReference
			);
		}

		const authPartnership = await this.createPartnership(
			walletAuth,
			campaignReference
		);
		// const authPartnership = await walletAuth.addPartnership(campaignReference);

		const authToken = await this.auth.getAuthToken();
		await this.api
			.relatedPartnerships(authToken)
			.post(authPartnership.id, campaignReference);

		this.partnerships = [...this.partnerships, authPartnership];

		return this.partnerships;
	}

	public unloadAllPartnerships() {
		this.partnerships = [];
	}

	/**
	 * Load all partnerships owned and indexed by related DIDs
	 */
	public async loadRelatedPartnerships() {
		const authToken = await this.auth.getAuthToken();
		const related = await this.api.relatedPartnerships(authToken).get();

		const newPartnerships = [...this.partnerships];
		related.data.forEach((p) => {
			if (!newPartnerships.find((np) => np.id === p.id)) {
				newPartnerships.push(p as Partnership);
			}
		});
		this.partnerships = newPartnerships;

		return this.partnerships;
	}
}
