import Script from "next/script";

import { magicPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";

const MagicLogin = () => {
	return (
		<>
			<Preloader message="Loading Magic..." />
			<Script
				src="https://auth.magic.link/pnp/login"
				data-magic-publishable-api-key={magicPublicKey}
				data-redirect-uri="/magic/callback"
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

export default MagicLogin;
