// An endpoint that receives the callback response from Magic PNP and processes the User Connection

import { useEffect } from "react";
import { useRouter } from "next/router";
import urlJoin from "url-join";

import { useUser } from "@/hooks";
import Preloader from "@/components/Preloader";
import { isProd } from "@/env-config";
import { userFetched } from "@/providers/User";
import Authenticate from "@/modules/auth";
import Serve404 from "@/components/Serve404";

const authInstance = Authenticate.getInstance();

const AdminFunc = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();

	useEffect(() => {
		if (isProd || !(!isLoading && wallets.length > 0 && userFetched())) {
			return () => {};
		}

		const { slug } = router.query;
		const option = urlJoin(
			...(Array.isArray(slug) ? (slug as string[]) : [slug as string])
		);
		console.log("option", option);
		switch (option) {
			case "destroy-owner": {
				// remove owner id from the wallet
				(async () => {
					const auths = authInstance.getAll();
					await Promise.all(auths.map((auth) => auth.setShareableOwnerId("")));
					console.log(
						"Auth Owner IDs have been Reset!",
						await Promise.all(auths.map((auth) => auth.getShareableOwnerId()))
					);
				})();
				break;
			}
			default: {
				window.location.href = "/404";
				break;
			}
		}
		return () => {};
	}, [isLoading, wallets]);

	return isProd ? <Serve404 /> : <Preloader message="Hi 👋" />;
};

export default AdminFunc;
