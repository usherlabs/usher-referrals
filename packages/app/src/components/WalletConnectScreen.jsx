import React, { useEffect, useState } from "react";
import { Pane, Heading, Text, Button, majorScale } from "evergreen-ui";
import PropTypes from "prop-types";
import useArConnect from "use-arconnect";
import Image from "next/image";
import Bowser from "bowser";

import { arConnectChromeURL, arConnectFirefoxURL } from "@/constants";

const WalletConnectScreen = ({ makeAddress, connect }) => {
	const arconnect = useArConnect();
	const [isArConnectLoaded, setArConnectLoaded] = useState(false);
	const [browserName, setBrowserName] = useState("");

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
	);
};

WalletConnectScreen.propTypes = {
	makeAddress: PropTypes.func.isRequired,
	connect: PropTypes.func.isRequired
};

export default WalletConnectScreen;
