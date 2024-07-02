import lscache from "lscache";
import { Base64 } from "js-base64";
import cuid from "cuid";

import { TOKEN_NAME, TOKEN_EXPIRY_MINUTES } from "@/constants";
import { ConflictStrategy, CampaignReference } from "@/types";
import Configure from "./configure";

lscache.setBucket(`${TOKEN_NAME}.`);

class Token {
	/**
	 * Get Next token for a given Campaign
	 */
	public static next(ref: CampaignReference) {
		const tokens = this.search(ref);
		// Order by created timestamps
		tokens.sort((a, b) => {
			return a.t - b.t;
		});

		if (tokens.length > 0) {
			return tokens[0].p;
		}

		return null;
	}

	/**
	 * Search Tokens by Campaign
	 */
	public static search(ref: CampaignReference) {
		const { chain, id } = ref;
		const allTokens = this.getAll();
		const results = allTokens.filter((token) => {
			const { p } = token;
			const [cToken] = p.split(".");
			const dec = Base64.decode(cToken).split(":");
			if (dec.length === 2) {
				if (dec[0] === chain && dec[1] === id) {
					return true;
				}
			}
			return false;
		});

		return results;
	}

	/**
	 * Parse the existing Query Parameters or provided URL
	 */
	public static parse(url?: string, keepQueryParam = false): string | null {
		if (!url && typeof window !== "undefined") {
			url = window.location.href;
		}

		if (!url) {
			return null;
		}

		const urlInstance = new URL(url);
		const newToken = urlInstance.searchParams.get("_ushrt");

		// If this a node environment, return the first token fetched before diving into local storage
		if (typeof window === "undefined") {
			return newToken;
		}

		if (!keepQueryParam) {
			if (window.history.replaceState) {
				urlInstance.searchParams.delete("_ushrt");
				window.history.replaceState(
					{ path: urlInstance.toString() },
					"",
					urlInstance.toString()
				);
			}
		}

		// Use the local storage to manage the cache
		lscache.flushExpired();

		// Add token to store alongside create date.
		if (!newToken) {
			return null;
		}

		// If conflict strategy is overwrite, ensure that all tokens for the existing campaign are removed.
		const strat = Configure.getConflictStrategy();
		if (strat === ConflictStrategy.OVERWRITE) {
			const [cToken] = newToken.split(".");
			const dec = Base64.decode(cToken).split(":");
			if (dec.length === 2) {
				const campaign = {
					chain: dec[0],
					id: dec[1]
				};
				const tokens = this.search(campaign);
				tokens.forEach((token) => {
					lscache.remove(token.k);
				});
			}
		}

		this.add(newToken);

		return newToken;
	}

	/**
	 * Get all tokens with key that includes token name
	 */
	public static getAll() {
		if (typeof window !== "undefined") {
			const keys = Object.keys(window.localStorage).filter(
				(k) => k.includes(TOKEN_NAME) && !k.includes(`cacheexpiration`)
			);
			const tokens: { p: string; k: string; t: number }[] = [];
			keys.forEach((k) => {
				const sp = k.split(".");
				if (sp.length === 2) {
					const uid = sp[1];
					const v = lscache.get(uid);
					if (v) {
						tokens.push({ ...v, k: uid });
					}
				}
			});
			return tokens;
		}

		return [];
	}

	/**
	 * Remove token from store by value
	 */
	public static remove(token: string) {
		const tokens = this.getAll();
		tokens
			.filter((t) => t.p === token)
			.forEach((t) => {
				lscache.remove(t.k);
			});
	}

	private static add(token: string) {
		// Remove first means that we're basiclaly refreshing this token
		this.remove(token);
		lscache.set(cuid(), { p: token, t: Date.now() }, TOKEN_EXPIRY_MINUTES);
	}
}

export default Token;
