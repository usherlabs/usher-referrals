/**
 * Here we implement https://github.com/magiclabs/magic-js/blob/master/packages/%40magic-sdk/pnp/src/context/callback.ts
 * We've modified the PNP logic to work with our local Magic SDK.
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Magic } from "magic-sdk";

import UserProvider from "@/providers/User";
import Preloader from "@/components/Preloader";
import { useUser } from "@/hooks";
import { Connections } from "@/types";
import { magic } from "@/utils/magic-client";

// https://github.com/pubkey/broadcast-channel -- to prevent multiple tabs from processing the same connection.

type CallbackType = "oauth" | "magic_credential" | "settings";

class MagicPNPCallback {
	private urlParams;

	constructor() {
		const queryString = window.location.search;
		this.urlParams = new URLSearchParams(queryString);
	}

	public async handleOAuthCallback() {
		if (!magic) {
			return {};
		}
		const res = await magic.oauth.getRedirectResult();
		return {
			idToken: res.magic.idToken,
			userMetadata: res.magic.userMetadata,
			oauth: res.oauth
		};
	}

	public async handleMagicLinkRedirectCallback() {
		if (!magic) {
			return {};
		}
		const idToken = await magic.auth.loginWithCredential();
		const userMetadata = await magic.user.getMetadata();
		return { idToken, userMetadata };
	}

	public async handleSettingsCallback() {
		if (!magic) {
			return {};
		}
		const idToken = await magic.user.getIdToken();
		const prevUserMetadata =
			magic.pnp.decodeUserMetadata(this.urlParams.get("prev_user_metadata")) ??
			undefined;
		const currUserMetadata =
			magic.pnp.decodeUserMetadata(this.urlParams.get("curr_user_metadata")) ??
			(await magic.user.getMetadata());
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
		if (!magic) {
			return {};
		}
		const idToken =
			this.urlParams.get("didt") || (await magic.user.getIdToken());
		const userMetadata = await magic.user.getMetadata();
		return { idToken: decodeURIComponent(idToken), userMetadata };
	}

	public static clearURLQuery() {
		const urlWithoutQuery = window.location.origin + window.location.pathname;
		window.history.replaceState(null, "", urlWithoutQuery);
	}

	public static getCallbackType(
		urlParams: URLSearchParams
	): CallbackType | null {
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
}

const Screen = () => {
	// const {
	// 	actions: { connect }
	// } = useUser();
	const router = useRouter();
	useEffect(() => {
		// Ensure that the page is refreshed when router completes a url change
		const handleRefresh = () => {
			window.location.reload();
		};
		router.events.on("routeChangeComplete", handleRefresh);
		return () => {
			router.events.off("routeChangeComplete", handleRefresh);
		};
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			console.log(window.location.search);
			window.addEventListener("@magic/ready", (e) => {
				// connect(Connections.MAGIC);
				// @ts-ignore
				const { idToken } = e.detail;
				console.log(e);
				(async () => {
					if (magic) {
						// await magic.auth
						// 	.loginWithCredential
						// 	// "0xbb44d366afd12baea0cdee0c806ec9f56f69fc58e365c40822cfeb71aa186b0e30f03cd5423c4ab6a699a049157bdc6aabfa897eaf6216473c9af60264acda2a1c" // -- Given DID token is invalid or malformed.
						// 	();
						const isLoggedIn = await magic.user.isLoggedIn();
						console.log(`logged in`, isLoggedIn);
						console.log(magic.pnp);
						console.log(magic);
					}
				})();
			});
		}
	}, []);

	return <Preloader message="Connecting with Magic..." />;
};

const MagicCallback = () => {
	return (
		<UserProvider>
			<Screen />
		</UserProvider>
	);
};

export default MagicCallback;
