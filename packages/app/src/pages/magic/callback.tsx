import { useEffect } from "react";
import Script from "next/script";
import { magicPublicKey } from "@/env-config";

import UserProvider from "@/providers/User";
import Preloader from "@/components/Preloader";
import { useUser } from "@/hooks";
import { Connections } from "@/types";
import { magic } from "@/utils/magic-client";

// https://github.com/pubkey/broadcast-channel -- to prevent multiple tabs from processing the same connection.

const Screen = () => {
	const {
		actions: { connect }
	} = useUser();

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("@magic/ready", (e) => {
				// connect(Connections.MAGIC);
				// @ts-ignore
				const { idToken } = e.detail;
				console.log(e);
				(async () => {
					if (magic) {
						await magic.auth.loginWithCredential();
						const isLoggedIn = await magic.user.isLoggedIn();
						console.log(`logged in`, isLoggedIn);
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
			<Script
				src="https://auth.magic.link/pnp/callback"
				data-magic-publishable-api-key={magicPublicKey}
			/>
		</UserProvider>
	);
};

export default MagicCallback;
