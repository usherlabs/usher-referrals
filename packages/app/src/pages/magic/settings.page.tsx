// TODO: Currently this settings modal isn't showing...

import Script from "next/script";

import { magicPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";

let redirectUri = "/";
if (typeof window !== "undefined") {
	const urlParams = new URLSearchParams(window.location.search);
	redirectUri = decodeURIComponent(urlParams.get("redir") || "") || redirectUri;
}

const MagicSettings = () => {
	return (
		<>
			<Preloader message="Loading Magic Settings..." />
			<Script
				src="https://auth.magic.link/pnp/settings"
				data-magic-publishable-api-key={magicPublicKey}
				data-redirect-uri={redirectUri}
			/>
		</>
	);
};

export const getStaticProps = async () => {
	return {
		props: {
			noUser: true
		}
	};
};

export default MagicSettings;
