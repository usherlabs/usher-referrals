/**
 * Here we implement https://github.com/magiclabs/magic-js/blob/master/packages/%40magic-sdk/pnp/src/context/callback.ts
 * We've modified the PNP logic to work with our local Magic SDK.
 */

import { useEffect } from "react";
import { setCookie } from "nookies";
import { Base64 } from "js-base64";

import UserProvider from "@/providers/user/User";
import Preloader from "@/components/Preloader";

import { getMagicClient } from "@/utils/magic-client";

// https://github.com/pubkey/broadcast-channel -- to prevent multiple tabs from processing the same connection.

type CallbackType = "oauth" | "magic_credential" | "settings";

class MagicPNP {
	private urlParams;

	private magic;

	constructor() {
		const queryString = window.location.search;
		this.urlParams = new URLSearchParams(queryString);
		const { magic } = getMagicClient();
		this.magic = magic;
	}

	public async handleOAuthCallback() {
		const res = await this.magic.oauth.getRedirectResult();
		return {
			idToken: res.magic.idToken,
			userMetadata: res.magic.userMetadata,
			oauth: res.oauth
		};
	}

	public async handleMagicLinkRedirectCallback() {
		const idToken = await this.magic.auth.loginWithCredential();
		const userMetadata = await this.magic.user.getMetadata();
		this.clearURLQuery();
		return { idToken, userMetadata };
	}

	public async handleSettingsCallback() {
		const idToken = await this.magic.user.getIdToken();
		const prevUserMetadata =
			this.magic.pnp.decodeUserMetadata(
				this.urlParams.get("prev_user_metadata")
			) ?? undefined;
		const currUserMetadata =
			this.magic.pnp.decodeUserMetadata(
				this.urlParams.get("curr_user_metadata")
			) ?? (await this.magic.user.getMetadata());
		this.clearURLQuery();
		return { idToken, userMetadata: currUserMetadata, prevUserMetadata };
	}

	/**
	 * Generically handles auth callback for methods where
	 * a redirect in not applicable. Examples include:
	 *
	 * - SMS login
	 * - Magic link login w/o `redirectURI`
	 * - WebAuthn login
	 * - Cases where the user has landed direclty
	 *   on the callback page without a redirect
	 */
	public async handleGenericCallback() {
		const idToken =
			this.urlParams.get("didt") || (await this.magic.user.getIdToken());
		const userMetadata = await this.magic.user.getMetadata();
		this.clearURLQuery();
		return { idToken: decodeURIComponent(idToken), userMetadata };
	}

	public clearURLQuery() {
		const urlWithoutQuery = window.location.origin + window.location.pathname;
		window.history.replaceState(null, "", urlWithoutQuery);
	}

	public getCallbackType(): CallbackType | null {
		const { urlParams } = this;
		if (urlParams.get("state")) {
			return "oauth";
		}

		if (urlParams.get("magic_credential")) {
			return "magic_credential";
		}

		if (urlParams.get("prev_user_metadata")) {
			return "settings";
		}

		return null;
	}

	public async handle() {
		switch (this.getCallbackType()) {
			case "oauth":
				return this.handleOAuthCallback();
			case "magic_credential":
				return this.handleMagicLinkRedirectCallback();
			case "settings":
				return this.handleSettingsCallback();
			default:
				return this.handleGenericCallback();
		}
	}
}

const Screen = () => {
	useEffect(() => {
		if (typeof window !== "undefined") {
			(async () => {
				const magicPnp = new MagicPNP();
				const response = await magicPnp.handle();
				const enc = Base64.encodeURI(JSON.stringify(response));
				setCookie(null, "__usher_magic_connect", enc, {
					maxAge: 24 * 60 * 60, // 1 days
					path: "/"
				});
				window.location.replace("/");
			})();
		}
	}, []);

	return <Preloader message="Processing Magic..." />;
};

const MagicCallback = () => {
	return (
		<UserProvider>
			<Screen />
		</UserProvider>
	);
};

export async function getStaticProps() {
	return {
		props: {
			noUser: true
		}
	};
}

export default MagicCallback;
