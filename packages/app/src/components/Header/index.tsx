import React from "react";
import { Pane } from "evergreen-ui";
import { useUserWallet } from "@/hooks";
import { useMobileMenu } from "@/components/Header/hooks/use-mobile-menu";
import { WalletButton } from "@/components/Header/WalletButton";
import { MobileMenu } from "@/components/Header/MobileMenu";
import { MobileHeaderLogo } from "@/brand/logo-components/MobileHeaderLogo";
import { UserButton } from "@/components/Header/UserButton";
import { css } from "@linaria/core";
import * as mediaQueries from "@/utils/media-queries";
import Anchor from "@/components/Anchor";
import { MenuToggleButton } from "@/components/Header/MenuToggleButton";

type Props = {
	height: number;
	walletCount: number;
	onWalletClick: () => void;
	onSettingsClick: () => void;
	onLogoutClick: () => void;
};

const Header: React.FC<Props> = ({
	height,
	onWalletClick,
	onSettingsClick,
	onLogoutClick,
	...props
}) => {
	const { showMobileMenu, toggleMobileMenu, setShowMobileMenu } =
		useMobileMenu();
	const { isWalletLoading, walletCount } = useUserWallet();

	return (
		<Pane width="100%" height={height} {...props}>
			<Pane
				marginX="auto"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Anchor
					href="/"
					className={css`
						${mediaQueries.gtLarge} {
							display: none !important;
						}
					`}
				>
					<MobileHeaderLogo height={height} />
				</Anchor>
				<Pane
					display="flex"
					paddingX={16}
					className={css`
						z-index: 9;
						background-color: #fff;
						border-radius: 32px;
						padding: 10px 20px;

						${mediaQueries.isXSmall} {
							padding-left: 0px;
						}
					`}
				>
					<UserButton
						height={height}
						onSettingsClick={onSettingsClick}
						onLogoutClick={onLogoutClick}
					/>
					<WalletButton
						height={height}
						walletCount={walletCount}
						isWalletLoading={isWalletLoading}
						onWalletClick={onWalletClick}
					/>
					<MenuToggleButton
						height={height}
						toggleMobileMenu={toggleMobileMenu}
					/>
				</Pane>
			</Pane>
			<MobileMenu
				showMobileMenu={showMobileMenu}
				toggleMobileMenu={toggleMobileMenu}
				setShowMobileMenu={setShowMobileMenu}
			/>
		</Pane>
	);
};

Header.defaultProps = {
	walletCount: 0
};

export default Header;
