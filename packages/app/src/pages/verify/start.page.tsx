/**
 * We render a page first to load the user -- the use the dids to associate the result
 *
 * This page will accept the authentication token via the query parameter.
 */

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Pane, toaster } from "evergreen-ui";
import Preloader from "@/components/Preloader";
import { getAuthRequest } from "@/api";
import { BrandLogoDark } from "@/brand/logo-components/BrandLogos";

const VerifyStart = () => {
	const router = useRouter();
	const { token, redir } = router.query;

	useEffect(() => {
		if (!token) {
			return () => {};
		}
		(async () => {
			const authToken = token as string;
			const request = getAuthRequest(authToken);
			let qs = "";
			if (redir) {
				qs = `?redir=${redir}`;
			}
			const response: { success: boolean; redirectUri: string } = await request
				.get(`verify/start${qs}`)
				.json();

			if (response.success) {
				window.location.replace(response.redirectUri);
			} else {
				toaster.danger(
					"Something has gone wrong initiating the verification. Please refresh the page or contact support."
				);
			}
		})();
		return () => {};
	}, [token, redir]);

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
				<Image src={BrandLogoDark} width={120} objectFit="contain" />
			</Pane>
		</Pane>
	);
};

export const getStaticProps = async () => {
	return {
		props: {
			noUser: true
		}
	};
};

export default VerifyStart;
