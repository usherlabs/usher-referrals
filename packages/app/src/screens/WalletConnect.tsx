import React, { useCallback, useEffect, useState } from "react";
import { Pane, Heading, Text, Button, majorScale, Link } from "evergreen-ui";
import Image from "next/image";
import Bowser from "bowser";

import { useWallet } from "@/hooks/";
import {
	ARCONNECT_CHROME_URL,
	ARCONNECT_FIREFOX_URL
	// SKIPPED_WALLET_ADDRESS
} from "@/constants";
import ArConnectIcon from "@/assets/icon/arconnect.svg";

const WalletConnectScreen = () => {
	const {
		isLoading,
		isArConnectLoaded,
		actions: { getWallet }
	} = useWallet();
	const [browserName, setBrowserName] = useState("");

	const connect = useCallback(() => getWallet(true), [getWallet]);
	const skipConnect = useCallback(() => {
		// setWallet({ address: SKIPPED_WALLET_ADDRESS })
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const name = Bowser.getParser(
				window.navigator.userAgent
			).getBrowserName();
			setBrowserName(name);
		}
		return () => {};
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
				👋&nbsp;&nbsp;Welcome!
			</Heading>
			<Text size={500}>To get started, connect your wallet</Text>
			<Pane
				background="tint2"
				padding={16}
				margin={12}
				borderRadius={8}
				display="flex"
				flexDirection="column"
			>
				{isArConnectLoaded ? (
					<Button
						height={majorScale(7)}
						appearance="primary"
						iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
						onClick={connect}
						isLoading={isLoading}
						minWidth={260}
					>
						<strong>Connect with ArConnect</strong>
					</Button>
				) : (
					<Link
						href={
							browserName.toLowerCase().includes("firefox")
								? ARCONNECT_FIREFOX_URL
								: ARCONNECT_CHROME_URL
						}
						target="_blank"
						rel="nopenner noreferrer"
					>
						<Button
							height={majorScale(7)}
							iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
							minWidth={260}
						>
							<strong>Install ArConnect</strong>
						</Button>
					</Link>
				)}
			</Pane>
			<Button
				height={majorScale(5)}
				minWidth={260}
				appearance="minimal"
				onClick={skipConnect}
			>
				<strong>Connect Wallet Later</strong>
			</Button>
		</Pane>
	);
};

WalletConnectScreen.propTypes = {};

export default WalletConnectScreen;
