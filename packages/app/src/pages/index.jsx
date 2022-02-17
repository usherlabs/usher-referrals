import { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import useArConnect from "use-arconnect";
import isEmpty from "lodash/isEmpty";

import Header from "@/components/Header";
import WalletConnectScreen from "@/components/WalletConnectScreen";
import Preloader from "@/components/Preloader";

const Home = () => {
	const arconnect = useArConnect();
	const [address, setAddress] = useState("");
	// const [user, setUser] = useState({});
	const [isPreloading, setPreloading] = useState(true);

	useEffect(() => {
		// Cancel preloader
		setTimeout(() => {
			setPreloading(false);
		}, 500);
	}, []);

	const makeAddress = useCallback(async () => {
		if (typeof arconnect === "object") {
			const a = await arconnect.getActiveAddress();
			setAddress(a);
		}
	}, [arconnect]);

	const connect = useCallback(async () => {
		await arconnect.connect(["ACCESS_ADDRESS"], {
			name: "Usher",
			logo: "/static/logo/Logo-Icon-Light.png"
		});

		makeAddress();
	}, [arconnect, makeAddress]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			padding={16}
			maxWidth={1280}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
		>
			{isPreloading && <Preloader />}
			<Header walletAddress={address} username="@ryanwould" />
			{isEmpty(address) && (
				<WalletConnectScreen makeAddress={makeAddress} connect={connect} />
			)}
		</Pane>
	);
};

export default Home;
