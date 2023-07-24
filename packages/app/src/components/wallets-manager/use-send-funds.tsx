import handleException from "@/utils/handle-exception";
import { Chains, Connections, Wallet } from "@usher.so/shared";
import { atom, useAtom } from "jotai";
import Anchor from "@/components/Anchor";
import { getArweaveClient } from "@/utils/arweave-client";
import { MagicWallet } from "@usher.so/auth/src/lib/magicWallet";
import { Paragraph, Strong, toaster } from "evergreen-ui";
import React, { useCallback } from "react";
import { ono } from "@jsdevtools/ono";
import { useCustomTheme } from "@/brand/themes/theme";
import { useUser } from "@/hooks";

const sendFundsAtoms = {
	sendFundsShow: atom<{
		wallet: Wallet;
		amount: number;
	} | null>(null),
	loading: atom(false),
	sending: atom(false)
};
export const useSendFunds = () => {
	const {
		auth,
		user: { wallets }
	} = useUser();
	const { colors } = useCustomTheme();
	const [showSendFunds, setShowSendFunds] = useAtom(
		sendFundsAtoms.sendFundsShow
	);
	const [sendFundsLoading, setSendFundsLoading] = useAtom(
		sendFundsAtoms.loading
	);
	const arweave = getArweaveClient();

	const [sendingFunds, setSendingFunds] = useAtom(sendFundsAtoms.sending);

	/* TODO: Requires testing */
	const onShowSendFunds = React.useCallback(
		async (wallet: Wallet) => {
			setSendFundsLoading(true);
			try {
				const winston = await arweave.wallets.getBalance(wallet.address);
				const ar = arweave.ar.winstonToAr(winston);
				const amount = parseFloat(ar);
				setShowSendFunds({ wallet, amount });
			} catch (e) {
				handleException(e);
			}
			setSendFundsLoading(false);
		},
		[arweave.ar, arweave.wallets, setSendFundsLoading, setShowSendFunds]
	);

	const sendFunds = useCallback(async () => {
		// Send funds in amount to address
		// Get JWK for the wallet.
		// For all wallets, get the ethereum magic wallet -- this is the source wallet
		const magicEthWallet = wallets.find(
			(wallet) =>
				wallet.chain === Chains.ETHEREUM &&
				wallet.connection === Connections.MAGIC
		);
		if (!magicEthWallet) {
			return;
		}
		if (!showSendFunds) {
			return;
		}

		setSendingFunds(true);
		try {
			// Get the auth for this wallet
			const magicAuth = new MagicWallet(auth, arweave);
			const jwk = await magicAuth.getMagicArweaveJwk();
			const tx = await arweave.createTransaction(
				{
					target: showSendFunds.wallet.address,
					quantity: arweave.ar.arToWinston(`${showSendFunds.amount}`)
				},
				jwk
			);
			await arweave.transactions.sign(tx, jwk);
			const response = await arweave.transactions.post(tx);
			if (response.status === 200) {
				toaster.success(`Your funds have been sent!`, {
					description: (
						<Paragraph marginTop={8}>
							Confirmed transaction&nbsp;
							<Anchor
								href={`https://viewblock.io/arweave/tx/${tx.id}`}
								external
							>
								<Strong color={colors.blue500} textDecoration="underline">
									{tx.id}
								</Strong>
							</Anchor>
						</Paragraph>
					),
					duration: 30,
					id: "success-send-funds"
				});
			} else {
				throw ono("Failed to post transcation to Arweave", showSendFunds);
			}
		} catch (e) {
			handleException(e);
			toaster.danger(
				"A problem has occurred sending your funds. The team has been notified. Please try again later or contact support",
				{
					duration: 10,
					id: "error-send-funds"
				}
			);
		} finally {
			setSendingFunds(false);
		}
	}, [arweave, auth, colors.blue500, setSendingFunds, showSendFunds, wallets]);

	return {
		sendFunds,
		onShowSendFunds,
		showSendFunds,
		setShowSendFunds,
		sendFundsLoading,
		sendingFunds
	};
};
