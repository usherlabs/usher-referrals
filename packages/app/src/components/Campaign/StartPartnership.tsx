import React from "react";
import { Button, majorScale, Pane, Paragraph, Strong } from "evergreen-ui";
import startCase from "lodash/startCase";

import { Chains } from "@usher.so/shared";
import { useCustomTheme } from "@/brand/themes/theme";
import {
	partnerAtoms,
	useStartPartnership
} from "@/pages/campaign/[chain]/_utils/use-start-partnership";
import { useAtomValue } from "jotai";
import { useUser } from "@/hooks";
import { useSetToCampaignChain } from "@/components/Campaign/use-set-to-campaign-chain";
import useRedir from "../../hooks/use-redir";
import { useRouter } from "next/router";

export type Props = {
	campaignChain: Chains;
	campaignId: string;
	hasWallets?: boolean;
};

const CampaignStartPartnership: React.FC<Props> = ({
	campaignChain,
	campaignId,
	hasWallets = true
}) => {
	const {
		user: { wallets }
	} = useUser();
	const { colors } = useCustomTheme();
	const isConnectedToSameChain = campaignChain === wallets?.[0]?.chain;
	const { settingChain, setToCampaignChain } = useSetToCampaignChain({
		campaignChain
	});

	const isLoading = useAtomValue(partnerAtoms.partnering);
	const startPartnership = useStartPartnership({
		campaignChain,
		campaignId
	});

	const router = useRouter();

	const loginUrl = useRedir("/login");

	const isLoggedIn = wallets.length > 0;

	const redirectToLogin = () => {
		router.push(loginUrl);
	};

	const buttonProps = {
		height: majorScale(7),
		appearance: "primary",
		minWidth: 250,
		isLoading: isLoading || settingChain
	};
	const ButtonChild =
		isConnectedToSameChain || !isLoggedIn ? (
			<Strong color="#fff" fontSize="1.1em">
				👉&nbsp;&nbsp;Start a Partnership
			</Strong>
		) : (
			<Strong color="#fff" fontSize="1.1em">
				Switch Network to Start
			</Strong>
		);

	return (
		<Pane
			border
			borderRadius={8}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			height={300}
			background="tint2"
		>
			<Button
				onClick={() =>
					isLoggedIn
						? isConnectedToSameChain
							? startPartnership()
							: setToCampaignChain()
						: redirectToLogin()
				}
				{...buttonProps}
			>
				{ButtonChild}
			</Button>
			{!hasWallets && (
				<Paragraph
					marginTop={8}
					textAlign="center"
					fontSize="1.1em"
					opacity="0.8"
					color={colors.gray900}
				>
					Connect a wallet for the {startCase(campaignChain)} blockchain
				</Paragraph>
			)}
		</Pane>
	);
};

export default CampaignStartPartnership;
