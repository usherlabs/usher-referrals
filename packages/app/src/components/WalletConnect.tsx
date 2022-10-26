import React, { useCallback, useState } from "react";
import { Pane, Button, majorScale } from "evergreen-ui";
import Image from "next/image";
import { browserName } from "react-device-detect";

import { Connections } from "@/types";
import { useUser, useArConnect, useMetaMask } from "@/hooks/";
import {
	ARCONNECT_CHROME_URL,
	ARCONNECT_FIREFOX_URL,
	METAMASK_CHROME_URL,
	METAMASK_FIREFOX_URL
} from "@/constants";
import { UilLockOpenAlt } from "@iconscout/react-unicons";
import ArConnectIcon from "@/assets/icon/arconnect.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";

export type Props = {
	hide?: Connections[];
	onConnect?: (connection: string) => void;
	loading?: boolean;
};

const WalletConnect: React.FC<Props> = ({
	hide = [],
	onConnect = () => {},
	loading: isPropLoading = false
}) => {
	const {
		isLoading: isUserLoading,
		actions: { connect }
	} = useUser();
	const [getArConnect] = useArConnect();
	const [getMetaMask] = useMetaMask();

	const [isConnecting, setConnecting] = useState(false);
	const isLoading = isUserLoading || isConnecting || isPropLoading;

	const connectArConnect = useCallback(() => {
		const arconnect = getArConnect();
		if (arconnect) {
			setConnecting(true);
			connect(Connections.ARCONNECT)
				.then(() => {
					onConnect(Connections.ARCONNECT); // used to close the sidesheet.
				})
				.finally(() => {
					setConnecting(false);
				});
		} else {
			const openLink = browserName.toLowerCase().includes("firefox")
				? ARCONNECT_FIREFOX_URL
				: ARCONNECT_CHROME_URL;
			window.open(openLink);
		}
	}, [browserName]);

	const connectMagic = useCallback(() => {
		setConnecting(true);
		connect(Connections.MAGIC)
			.then(() => {
				onConnect(Connections.MAGIC);
			})
			.finally(() => {
				setConnecting(false);
			});
	}, []);

	const connectMetaMask = useCallback(() => {
		const metamask = getMetaMask();

		if (metamask) {
			setConnecting(true);
			connect(Connections.METAMASK)
				.then(() => {
					onConnect(Connections.METAMASK); // used to close the sidesheet.
				})
				.finally(() => {
					setConnecting(false);
				});
		} else {
			const openLink = browserName.toLowerCase().includes("firefox")
				? METAMASK_FIREFOX_URL
				: METAMASK_CHROME_URL;
			window.open(openLink);
		}
	}, [browserName]);

	return (
		<Pane display="flex" flexDirection="column">
			{!hide.includes(Connections.ARCONNECT) && (
				<Pane marginBottom={8}>
					<Button
						height={majorScale(7)}
						iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
						onClick={connectArConnect}
						isLoading={isLoading}
						minWidth={300}
					>
						<strong>Connect with ArConnect</strong>
					</Button>
				</Pane>
			)}
			{!hide.includes(Connections.METAMASK) && (
				<Pane marginBottom={8}>
					<Button
						height={majorScale(7)}
						iconBefore={<Image src={MetaMaskIcon} width={30} height={30} />}
						onClick={connectMetaMask}
						isLoading={isLoading}
						minWidth={300}
					>
						<strong>Connect with MetaMask</strong>
					</Button>
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
