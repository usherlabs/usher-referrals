import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";
import debounce from "lodash/debounce";

import useUser from "@/hooks/use-user";
import Header from "@/components/Header";
import WalletConnectScreen from "@/screens/WalletConnect";
import EmailConnectScreen from "@/screens/EmailConnect";
import DashboardScreen from "@/screens/Dashboard";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";
import delay from "@/utils/delay";
import getAuthReqeust from "@/utils/request";
import { isProd } from "@/env-config";
import events from "@/utils/events";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

const joinDiscordGuild = async () => {
	const request = await getAuthReqeust();
	const response = await request.post("/discord").then(({ data }) => data);

	return response;
};

// Debounce to minise duplicate API calls.
const saveWallet = debounce(async (user, address) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const getResp = await supabase
		.from("wallets")
		.select(`user_id, address, id`)
		.eq("address", address);
	const { data, error, status } = getResp;
	if (error && status !== 406) {
		throw error;
	}
	// console.log(`select`, data);

	if (isEmpty(data)) {
		const r = await supabase.from("wallets").insert(
			{ address, user_id: user.id },
			{
				returning: "minimal" // Don't return the value after inserting
			}
		);
		// console.log(r);
		if (r.error && r.status !== 406) {
			throw error;
		}
		await joinDiscordGuild(); // Join Discord Guild if new Wallet.
	}
}, 500);

const Home = () => {
	const arconnect = useArConnect();
	const [address, setAddress] = useState("");
	const [user] = useUser();
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		(async () => {
			// Developer
			if (!isProd) {
				const session = await supabase.auth.session();
				console.log("DEVELOPMENT MODE:", session, user);
			}
		})();
	}, []);

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);
	}, []);

	useEffect(() => {
		const onSignIn = async (u) => {
			try {
				// console.log(u, address);
				await saveWallet(u, address);
			} catch (error) {
				handleException(error);
				alerts.error();
			}
		};
		events.on("SIGN_IN", onSignIn);

		return () => {
			events.off("SIGN_IN", onSignIn);
		};
	}, [address]);

	const makeAddress = useCallback(async () => {
		if (typeof arconnect === "object") {
			try {
				const a = await arconnect.getActiveAddress();
				setAddress(a);
				return a;
			} catch (e) {
				// ... ArConnect is loaded but has been disconnected.
			}
		}
		return "";
	}, [arconnect]);

	const connectWallet = useCallback(async () => {
		try {
			await arconnect.connect(["ACCESS_ADDRESS"], {
				name: "Usher",
				logo: LogoImage
			});

			await delay(1000);
			const a = await makeAddress();

			// 1. Check if a user is authorised.
			// 2. Check if there is a wallet associated to this user.
			// 3. If so, and wallet does not match the authorised user's wallet, insert it.
			if (!isEmpty(user)) {
				try {
					await saveWallet(user, a);
				} catch (error) {
					handleException(error);
					alerts.error();
				}
			}
		} catch (e) {
			// Will throw where user cancels.
		}
	}, [arconnect, makeAddress, user]);

	// const connectService = useCallback(async () => {
	// 	// Connect to Discord
	// 	const { error } = await supabase.auth.signIn(
	// 		{
	// 			provider: "discord"
	// 		},
	// 		{
	// 			scopes: "identify guilds.join" // https://github.com/supabase/gotrue-js/blob/12d02c35209bbd9f8f51af8d0aeee5e86fcc2a6e/src/GoTrueApi.ts#L68
	// 		}
	// 	);
	// 	if (error) {
	// 		handleException(error);
	// 		alerts.error();
	// 	}
	// }, []);

	const connectEmail = useCallback(async (email) => {
		// Connect with Email
		const { error } = await supabase.auth.signIn({
			email
		});
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	const disconnectService = useCallback(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
		// State is set in Auth Update.
	}, []);

	const disconnectWallet = useCallback(async () => {
		arconnect.disconnect();

		await delay(500);
		setAddress("");
	}, [arconnect]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{isPreloading && <Preloader />}
			<Header
				walletAddress={address}
				userProvider={user.app_metadata?.provider}
				username={user.user_metadata?.full_name}
				avatarUrl={user.user_metadata?.avatar_url}
				disconnectService={disconnectService}
				disconnectWallet={disconnectWallet}
			/>
			{isEmpty(address) && (
				<WalletConnectScreen
					makeAddress={makeAddress}
					connect={connectWallet}
				/>
			)}
			{isEmpty(user) && !isEmpty(address) && (
				<EmailConnectScreen connect={connectEmail} />
			)}
			{!isEmpty(user) && !isEmpty(address) && <DashboardScreen />}
		</Pane>
	);
};

export default Home;
