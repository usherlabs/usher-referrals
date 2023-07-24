import Script from "next/script";

import { magicPublicKey } from "@/env-config";
import Preloader from "@/components/Preloader";

const MagicLogin = () => {
	return (
		<>
			<Preloader message="Logging out of Magic..." />
			<Script
				src="https://auth.magic.link/pnp/logout"
				data-magic-publishable-api-key={magicPublicKey}
				data-redirect-uri="/login"
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
