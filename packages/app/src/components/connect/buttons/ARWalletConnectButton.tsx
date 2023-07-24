import { ARCONNECT_CHROME_URL, ARCONNECT_FIREFOX_URL } from "@/constants";
import { useArConnect } from "@/hooks";
import { Chains, Connections } from "@usher.so/shared";
import { PermissionType } from "arconnect";
import { Button, majorScale, Pane, toaster } from "evergreen-ui";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { browserName } from "react-device-detect";
import * as uint8arrays from "uint8arrays";
import { BrandLogomarkDark } from "@/brand/logo-components/BrandLogos";
import { brandName } from "@/brand/utils/names";

import { WalletConnectButtonProps } from "@/components/connect/buttons/types";

export type ARWalletConnectButtonProps =
	WalletConnectButtonProps<Connections.ARCONNECT>;

const useSignArweaveMessage = () => {
	const [arConnect] = useArConnect();
	const [signing, setSigning] = useState(false);

	const signMessage = useCallback(
		async ({ arweaveWallet }: { arweaveWallet: string }) => {
			try {
				setSigning(true);

				if (arConnect) {
					const authId = [Chains.ARWEAVE, arweaveWallet].join(":");
					const sig = await arConnect.signature(
						uint8arrays.fromString(authId),
						{
							name: "RSA-PSS",
							saltLength: 0 // This ensures that no additional salt is produced and added to the message signed.
						}
					);
					return uint8arrays.toString(sig);
				}

				// this shouldn't happen, as it is checked before
				throw new Error("ArConnect not installed");
			} catch (e) {
				toaster.danger("Sign the message with your wallet to continue");
				throw e;
			} finally {
				setSigning(false);
			}
		},
		[arConnect]
	);

	return {
		signMessage,
		signing
	};
};

export const ARWalletConnectButton = ({
	connection,
	text,
	icon,
	isConnecting,
	onConnect
}: ARWalletConnectButtonProps) => {
	const { signMessage, signing } = useSignArweaveMessage();
	const [arConnect] = useArConnect();
	const isLoading = useMemo(
		() => isConnecting || signing,
		[isConnecting, signing]
	);

	const internalIcon = useMemo(() => {
		if (React.isValidElement(icon)) {
			return icon;
		}
		return <Image src={icon} width={30} height={30} />;
	}, [icon]);

	const checkWalletInstalled = useCallback(async () => {
		if (!arConnect) {
			const openLink = browserName.toLowerCase().includes("firefox")
				? ARCONNECT_FIREFOX_URL
				: ARCONNECT_CHROME_URL;
			window.open(openLink);

			toaster.danger(
				"Please install ArConnect and reload the page to continue"
			);
			return false;
		}
		return true;
	}, [arConnect]);

	const connectWallet = useCallback(async () => {
		try {
			if (!checkWalletInstalled()) {
				return;
			}

			if (arConnect) {
				const permissions: PermissionType[] = ["ACCESS_ADDRESS", "SIGNATURE"];
				await arConnect.connect(permissions, {
					name: brandName.titleCase,
					logo: BrandLogomarkDark
				});
				// await delay(1000);
				const arweaveAddress = await arConnect.getActiveAddress();
				if (!arweaveAddress) {
					throw new Error();
				}

				const signedMessage = await signMessage({
					arweaveWallet: arweaveAddress
				});
				await onConnect({
					connectedAddress: arweaveAddress,
					signature: signedMessage,
					connection,
					connectedChain: Chains.ARWEAVE
				});
			}
		} catch {
			toaster.danger("Connect your wallet to continue");
		}
	}, [arConnect, checkWalletInstalled, connection, onConnect, signMessage]);

	return (
		<Pane marginBottom={8}>
			<Button
				height={majorScale(7)}
				iconBefore={internalIcon}
				onClick={connectWallet}
				isLoading={isLoading}
				minWidth={300}
			>
				<strong>{text}</strong>
			</Button>
		</Pane>
	);
};
