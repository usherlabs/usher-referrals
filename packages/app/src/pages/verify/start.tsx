/**
 * We render a page first to load the user -- the use the dids to associate the result
 */

import { useEffect } from "react";
import Image from "next/image";
import { Pane, toaster } from "evergreen-ui";
import Preloader from "@/components/Preloader";
import { getAuthRequest } from "@/api";
import Authenticate from "@/modules/auth";

import LogoImage from "@/assets/logo/Logo.png";

const VerifyStart = () => {
	useEffect(() => {
		(async () => {
			const authInstance = Authenticate.getInstance();
			const authToken = await authInstance.getAuthToken();
			const request = getAuthRequest(authToken);
			const queryParams = new URLSearchParams(window.location.search);
			const redir = queryParams.get("redir");
			let qs = "";
			if (redir) {
				qs = `?redir=${redir}`;
			}
			const response: { success: boolean; redirectUri: string } = await request
				.get(`verify/start${qs}`)
				.json();

			if (response.success) {
				window.location.href = response.redirectUri;
			} else {
				toaster.danger(
					"Something has gone wrong initiating the verification. Please refresh the page or contact support."
				);
			}
		})();
		return () => {};
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			<Preloader message={`Redirecting you to Personhood Verification...`} />
			<Pane
				zIndex={100}
				position="fixed"
				bottom={20}
				left={0}
				right={0}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Image src={LogoImage} width={150} objectFit="contain" />
			</Pane>
		</Pane>
	);
};

export default VerifyStart;
