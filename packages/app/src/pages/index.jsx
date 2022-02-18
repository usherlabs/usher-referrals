import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";

import Header from "@/components/Header";
import WalletConnectScreen from "@/components/WalletConnectScreen";
import ServiceConnectScreen from "@/components/ServiceConnectScreen";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { supabase } from "@/utils/supabase-client";
import delay from "@/utils/delay";

const Home = () => {
	const arconnect = useArConnect();
	const [address, setAddress] = useState("");
	const [user, setUser] = useState({});
	const [isPreloading, setPreloading] = useState(true);

	// Listen for auth state change
	supabase.auth.onAuthStateChange(async (event, session) => {
		switch (event) {
			case "SIGNED_IN": {
				// Set SignedIn User to State.
				const u = session.user;
				if (!isEmpty(u)) {
					if (u.role === "authenticated") {
						setUser(u);

						// Check if there is a wallet associated to this user.
						// If not, insert it.
						// As this is step 2, we're going to update the wallet only once this user connection is established.
						console.log(u);
						const { data, error } = await supabase
							.from("wallets")
							.select("user_id, id")
							.eq("user_id", u.id);
						if (error) {
							handleException(error);
							alerts.error();
							return;
						}
						// else{
						// 	const { data, error } = await supabase
						// 	.from("wallets")
						// 	.upsert({ id: a, updated_at: new Date(Date.now()).toISOString() });
						// console.log(data);
						// }
						console.log(data);
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
			await arconnect.connect(["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY"], {
				name: "Usher",
				logo: "/static/logo/Logo-Icon-Light.png"
			});

			await delay(1000);
			makeAddress();
		} catch (e) {
			// Will throw where user cancels.
		}
	}, [arconnect, makeAddress]);

	const connectService = useCallback(async () => {
		// Connect to Discord
		const { error } = await supabase.auth.signIn({
			provider: "discord"
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
				username={user.user_metadata?.name}
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
