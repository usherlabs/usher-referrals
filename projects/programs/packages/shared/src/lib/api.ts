import fetch from "isomorphic-unfetch";
import ky from "ky-universal";
import { KyInstance } from "ky/distribution/types/ky";

import { ApiOptions } from "./options.js";

export class Api {
	private readonly _options: ApiOptions;
	private readonly _request: KyInstance;

	constructor(options?: Partial<ApiOptions>) {
		this._options = new ApiOptions(options);
		this._request = ky.create({
			fetch,
			prefixUrl: this._options.usherUrl,
		});
	}

	protected getRequest() {
		return this._request;
	}

	protected getAuthRequest(authToken: string) {
		return this.getRequest().extend({
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});
	}
}
