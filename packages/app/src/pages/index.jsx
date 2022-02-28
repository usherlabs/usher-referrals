import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";
import debounce from "lodash/debounce";

import Header from "@/components/Header";
import WalletConnectScreen from "@/components/WalletConnectScreen";
import ServiceConnectScreen from "@/components/ServiceConnectScreen";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";
import delay from "@/utils/delay";
import getRequest from "@/utils/request";
import { isProd } from "@/env-config";

import LogoImage from "@/assets/logo/Logo-Icon.png";

const joinDiscordGuild = async () => {
	const request = await getRequest();
	const response = await request.post("/user/join").then(({ data }) => data);

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
	const [user, setUser] = useState({});
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		(async () => {
			// Developer
			if (!isProd) {
				console.log(await supabase.auth.session());
			}
		})();
	}, []);

	// Listen for auth state change
	supabase.auth.onAuthStateChange(async (event, session) => {
		switch (event) {
			case "SIGNED_IN": {
				// Set SignedIn User to State.
				const u = session.user;
				if (!isEmpty(u)) {
					if (u.role === "authenticated") {
						setUser(u);

						try {
							await saveWallet(u, address);
						} catch (error) {
							handleException(error);
							alerts.error();
						}
					}
				}
				break;
			}
			case "SIGNED_OUT": {
				setUser({});
				break;
			}
			default: {
				break;
			}
		}
	});

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);

		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				setUser(u);
			}
		}
	}, []);

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

	const connectService = useCallback(async () => {
		// Connect to Discord
		const { error } = await supabase.auth.signIn(
			{
				provider: "discord"
			},
			{
				scopes: "identify guilds.join" // https://github.com/supabase/gotrue-js/blob/12d02c35209bbd9f8f51af8d0aeee5e86fcc2a6e/src/GoTrueApi.ts#L68
			}
		);
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
			padding={16}
			maxWidth={1280}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{isPreloading && <Preloader />}
			<Header
				walletAddress={address}
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
				<ServiceConnectScreen connect={connectService} />
			)}
		</Pane>
	);
};

export default Home;
