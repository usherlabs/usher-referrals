import ArConnectIcon from "@/assets/icon/arconnect.svg";
import MetaMaskIcon from "@/assets/icon/metamask.svg";
import { ARCONNECT_CHROME_URL, ARCONNECT_FIREFOX_URL, METAMASK_CHROME_URL, METAMASK_FIREFOX_URL } from "@/constants";
import { useArConnect, useMetaMask } from "@/hooks";
import { Chains } from "@/types";
import { Button, Heading, majorScale, Pane, Strong, Text, toaster } from "evergreen-ui";
import Image from "next/image";
import { useCallback, useState } from "react";
import { browserName } from "react-device-detect";
import * as uint8arrays from "uint8arrays";

type Props = {
	domain: string,
	chain: Chains,
	onConnect: (address: string, signature: string) => Promise<boolean>;
}

const WalletInvite = ({ domain, chain, onConnect }: Props) => {

	const [getArConnect] = useArConnect();
	const [getMetaMask] = useMetaMask();

	const [isConnecting, setConnecting] = useState(false);

	const connectArConnect = useCallback(() => {
		const arconnect = getArConnect();
		if (arconnect) {
			setConnecting(true);
			// connect(Connections.ARCONNECT)
			// 	.then(() => {
			// 		onConnect(Connections.ARCONNECT); // used to close the sidesheet.
			// 	})
			// 	.finally(() => {
			// 		setConnecting(false);
			// 	});
		} else {
			const openLink = browserName.toLowerCase().includes("firefox")
				? ARCONNECT_FIREFOX_URL
				: ARCONNECT_CHROME_URL;
			window.open(openLink);
		}
	}, [browserName]);

	const connectMetaMask = useCallback(async () => {
		setConnecting(true);

		const metamask = getMetaMask();
		if (!metamask) {
			const openLink = browserName.toLowerCase().includes("firefox")
				? METAMASK_FIREFOX_URL
				: METAMASK_CHROME_URL;
			window.open(openLink);
			return;
		}

		try {
			const accounts = await metamask.send("eth_requestAccounts", [])
				.catch(() => { throw new Error("Connect with MetaMask to continue"); })

			const [address] = accounts as string[];
			const signer = metamask.getSigner();
			const message = `Please connect your wallet to continue to ${domain}`;
			const signedMessage = await signer.signMessage(uint8arrays.fromString(message))
				.catch(() => { throw new Error("Sign the message with MetaMask to continue"); });

			// TODO: Investigate if `toLowerCase()` is really needed here
			onConnect(address.toLowerCase(), signedMessage);
		} catch (e) {
			toaster.danger((e instanceof Error) ? e.message : String(e));
		} finally {
			setConnecting(false);
		}
	}, [browserName]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
			marginBottom={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				👋&nbsp;&nbsp;Welcome!
			</Heading>
			<Text size={500} textAlign="center">You've been invited.</Text>
			<Text size={500} textAlign="center">Please connect your wallet to continue to <Strong>{domain}</Strong></Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>

				{chain === Chains.ARWEAVE && (
					<Pane marginBottom={8}>
						<Button
							height={majorScale(7)}
							iconBefore={<Image src={ArConnectIcon} width={30} height={30} />}
							onClick={connectArConnect}
							isLoading={isConnecting}
							minWidth={300}
						>
							<strong>Connect with ArConnect</strong>
						</Button>
					</Pane>
				)}

				{chain === Chains.ETHEREUM && (
					<Pane marginBottom={8}>
						<Button
							height={majorScale(7)}
							iconBefore={<Image src={MetaMaskIcon} width={30} height={30} />}
							onClick={connectMetaMask}
							isLoading={isConnecting}
							minWidth={300}
						>
							<strong>Connect with MetaMask</strong>
						</Button>
					</Pane>)}
			</Pane>
		</Pane>
	)
}

export default WalletInvite;
