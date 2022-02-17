import { useEffect, useState, useCallback } from "react";
import { Pane, Heading, Text, Button, majorScale } from "evergreen-ui";
import useArConnect from "use-arconnect";
import Image from "next/image";
import Bowser from "bowser";
import isEmpty from "lodash/isEmpty";

import Header from "@/components/Header";
import { arConnectChromeURL, arConnectFirefoxURL } from "@/constants";

const Home = () => {
	const arconnect = useArConnect();
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);
	const [address, setAddress] = useState("");
	const [browserName, setBrowserName] = useState("");

	const makeAddress = useCallback(async () => {
		const a = await arconnect.getActiveAddress();
		console.log(a);
		setAddress(a);
	}, [arconnect]);

	const connect = async () => {
		const r = await arconnect.connect(["ACCESS_ADDRESS"], {
			name: "Usher",
			logo: "/static/logo/Logo-Icon-Light.png"
		});
		console.log(r);

		makeAddress();
	};

	useEffect(() => {
		if (typeof arconnect === "object") {
			setArConnectLoaded(true);

			makeAddress();
		}
	}, [arconnect, makeAddress]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const name = Bowser.getParser(
				window.navigator.userAgent
			).getBrowserName();
			setBrowserName(name);
		}
	}, []);

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
			<Header walletAddress={address} />
			{isEmpty(address) && (
				<Pane
					display="flex"
					flexDirection="column"
					flex={1}
					alignItems="center"
					justifyContent="center"
					padding={32}
				>
					<Heading is="h1" size={800} marginBottom={12}>
						Welcome!
					</Heading>
					<Text size={500}>To get started, connect your wallet</Text>
					<Pane background="tint2" padding={16} margin={12}>
						{isArConnectLoaded ? (
							<Button
								height={majorScale(7)}
								appearance="primary"
								iconBefore={
									<Image
										src="/static/asset/arconnect-logo.svg"
										width={30}
										height={30}
									/>
								}
								onClick={connect}
							>
								<strong>Connect with ArConnect</strong>
							</Button>
						) : (
							<a
								href={
									browserName.toLowerCase().includes("firefox")
										? arConnectFirefoxURL
										: arConnectChromeURL
								}
								target="_blank"
								rel="nopenner noreferrer"
							>
								<Button
									height={majorScale(7)}
									iconBefore={
										<Image
											src="/static/asset/arconnect-logo.svg"
											width={30}
											height={30}
										/>
									}
								>
									<strong>Install ArConnect</strong>
								</Button>
							</a>
						)}
					</Pane>
				</Pane>
			)}
		</Pane>
	);
};

export default Home;
