import React from "react";
import { Label, Pane, Spinner } from "evergreen-ui";
import { UilWallet } from "@iconscout/react-unicons";

import { MenuButton } from "@/components/Header/MenuButton";
import { useCustomTheme } from "@/brand/themes/theme";

interface WalletButtonProps {
	height: number;
	walletCount: number;
	isWalletLoading: boolean;
	onWalletClick: () => void;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
	height,
	walletCount,
	isWalletLoading,
	onWalletClick
}) => {
	const { colors } = useCustomTheme();

	return (
		<MenuButton height={height} onClick={onWalletClick}>
			<UilWallet size="32" color={colors.gray700} />
			{walletCount > 0 && (
				<Label
					position="absolute"
					top="5px"
					right="5px"
					width="20px"
					height="20px"
					fontWeight={900}
					backgroundColor={colors.blue500}
					color="#fff"
					borderRadius={100}
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					{walletCount}
				</Label>
			)}
			{isWalletLoading && (
				<Pane position="absolute" bottom="7.5px" right="7.5px">
					<Spinner size={16} />
				</Pane>
			)}
		</MenuButton>
	);
};
