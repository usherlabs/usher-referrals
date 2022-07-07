// An endpoint that receives the callback response from Magic PNP and processes the User Connection

import { useEffect } from "react";
import { parseCookies, destroyCookie } from "nookies";
import { Base64 } from "js-base64";
import { toaster } from "evergreen-ui";

import { useUser } from "@/hooks";
import Preloader from "@/components/Preloader";
import { Connections } from "@/types";

const MagicConnect = () => {
	const {
		actions: { connect }
	} = useUser();

	useEffect(() => {
		const cookies = parseCookies();
		const magicConnectToken = cookies.__usher_magic_connect;

		(async () => {
			try {
				if (!magicConnectToken) {
					throw new Error("Magic Connect Token does not exist");
				}

				const response = JSON.parse(Base64.decode(magicConnectToken));
				// Destroy the cookie on success
				destroyCookie(null, "__usher_magic_connect", {
					maxAge: 24 * 60 * 60, // 1 days
					path: "/"
				});
				// Do something with the email -- response.userMetadata.email
				console.log(response);
				await connect(Connections.MAGIC); // Authorise the Magic DID now that we're logged in.

				window.location.replace("/");
			} catch (e) {
				toaster.danger(
					"An error has occurred connecting with Magic. Please try again.",
					{
						id: "magic-error",
						duration: 10
					}
				);
			}
		})();
	}, []);

	return <Preloader message="Connecting with Magic..." />;
};

export default MagicConnect;
