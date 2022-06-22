/**
 * We render a page first to load the user -- the use the dids to associate the result
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Pane, toaster } from "evergreen-ui";
import Preloader from "@/components/Preloader";
import { getAuthRequest } from "@/api";
import Authenticate from "@/modules/auth";
import { useUser } from "@/hooks";

import LogoImage from "@/assets/logo/Logo.png";

const VerifyStart = () => {
	const {
		user: { wallets },
		isLoading
	} = useUser();
	const router = useRouter();
	const [isMounted, setMounted] = useState(false);

	useEffect(() => {
		if (isLoading && !isMounted) {
			// Set mount when user starts loading
			setMounted(true);
		}
		if (!isLoading && isMounted) {
			if (wallets.length === 0) {
				toaster.notify("To start a verification, please login!");
				router.push("/login"); // redirect to login page if no wallets authenticated.
				return () => {};
			}
			(async () => {
				const authInstance = Authenticate.getInstance();
				const authToken = await authInstance.getAuthToken();
				const request = getAuthRequest(authToken);
				const { redir } = router.query;
				let qs = "";
				if (redir) {
					qs = `?redir=${redir}`;
				}
				const response: { success: boolean; redirectUri: string } =
					await request.get(`verify/start${qs}`).json();

				if (response.success) {
					window.location.href = response.redirectUri;
				} else {
					toaster.danger(
						"Something has gone wrong initiating the verification. Please refresh the page or contact support."
					);
				}
			})();
		}
		return () => {};
	}, [isLoading, wallets, isMounted]);

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
