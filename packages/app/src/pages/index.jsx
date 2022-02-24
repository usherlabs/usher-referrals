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

import LogoImage from "@/assets/logo/Logo-Icon.png";

// Debounce to minise duplicate API calls.
const saveWallet = debounce(async (user, address) => {
	// Check if there is a wallet associated to this user.
	// If not, insert it, otherwise check if user_id has been updated (ie. new Discord user)
	const getResp = await supabase
		.from("wallets")
		.select(`user_id, id`)
		.eq("id", address);
	const { data, error, status } = getResp;
	if (error && status !== 406) {
		throw error;
	}

	if (isEmpty(data)) {
		const r = await supabase.from("wallets").insert(
			{ id: address, user_id: user.id },
			{
				returning: "minimal" // Don't return the value after inserting
			}
		);
		if (r.error && r.status !== 406) {
			throw error;
		}
	} else {
		const [{ user_id: userId }] = data;
		if (userId !== user.id) {
			const r = await supabase
				.from("wallets")
				.update({ user_id: user.id })
				.eq("id", address);
			if (r.error && r.status !== 406) {
				throw error;
			}
		}
	}
}, 500);

const Home = () => {
	const arconnect = useArConnect();
	const [address, setAddress] = useState("");
	const [user, setUser] = useState({});
	const [isPreloading, setPreloading] = useState(true);

	// Testing
	useEffect(() => {
		(async () => {
			const request = await getRequest();
			const response = await request
				.post("/user/join")
				.then(({ data }) => data);
			console.log(response);
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
