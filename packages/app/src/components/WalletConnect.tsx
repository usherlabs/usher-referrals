import React, { useCallback, useEffect, useState } from "react";
import { Pane, Button, majorScale, Link } from "evergreen-ui";
import Image from "next/image";
import Bowser from "bowser";

import { Connections } from "@/types";
import { useUser, useArConnect } from "@/hooks/";
import { ARCONNECT_CHROME_URL, ARCONNECT_FIREFOX_URL } from "@/constants";
import { UilLockOpenAlt } from "@iconscout/react-unicons";
import ArConnectIcon from "@/assets/icon/arconnect.svg";

export type Props = {
	hide: Connections[];
};

const WalletConnect: React.FC<Props> = ({ hide }) => {
	const {
		isLoading: isUserLoading,
		actions: { connect }
	} = useUser();
	const [, isArConnectLoading] = useArConnect();
	const [browserName, setBrowserName] = useState("");
	const [isConnecting, setConnecting] = useState(false);
	const isLoading = isUserLoading || isConnecting;

	const connectArConnect = useCallback(() => {
		setConnecting(true);
		connect(Connections.ARCONNECT).finally(() => {
			setConnecting(false);
		});
	}, []);

	const connectMagic = useCallback(() => {
		setConnecting(true);
		connect(Connections.MAGIC).finally(() => {
			setConnecting(false);
		});
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
		<Pane display="flex" flexDirection="column">
			{!hide.includes(Connections.ARCONNECT) && (
				<Pane marginBottom={8}>
					{!isArConnectLoading ? (
						<Button
							height={majorScale(7)}
							iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
							onClick={connectArConnect}
							isLoading={isLoading}
							minWidth={300}
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
								height={majorScale(6)}
								iconBefore={
									<Image src={ArConnectIcon} width={30} height={30} />
								}
								minWidth={300}
							>
								<strong>Install ArConnect</strong>
							</Button>
						</Link>
					)}
				</Pane>
			)}
			{!hide.includes(Connections.MAGIC) && (
				<Pane>
					<Button
						height={majorScale(7)}
						iconBefore={() => <UilLockOpenAlt size="28" />}
						onClick={connectMagic}
						isLoading={isLoading}
						minWidth={300}
					>
						<strong>Email, SMS, and more</strong>
					</Button>
				</Pane>
			)}
		</Pane>
	);
};

WalletConnect.defaultProps = {
	hide: []
};

export default WalletConnect;
