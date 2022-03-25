import React, { useEffect, useState } from "react";
import { Pane, Heading, Text, Button, majorScale, Link } from "evergreen-ui";
import PropTypes from "prop-types";
import Image from "next/image";
import Bowser from "bowser";

import useWallet from "@/hooks/use-wallet";
import { ARCONNECT_CHROME_URL, ARCONNECT_FIREFOX_URL } from "@/constants";
import ArConnectIcon from "@/assets/icon/arconnect.svg";

const WalletConnectScreen = ({ connect }) => {
	const [, , isArConnectLoaded] = useWallet();
	const [browserName, setBrowserName] = useState("");
	const [isLoading, setLoading] = useState(false);

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
			<Pane background="tint2" padding={16} margin={12}>
				{isArConnectLoaded ? (
					<Button
						height={majorScale(7)}
						appearance="primary"
						iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
						onClick={(e) => {
							setLoading(true);
							connect(e).finally(() => setLoading(false));
						}}
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
		</Pane>
	);
};

WalletConnectScreen.propTypes = {
	connect: PropTypes.func.isRequired
};

export default WalletConnectScreen;
