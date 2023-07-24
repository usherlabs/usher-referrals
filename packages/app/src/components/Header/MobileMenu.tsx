import React from "react";
import { Button, CrossIcon, Pane, SideSheet } from "evergreen-ui";
import BackgroundImage from "@/assets/side-menu-background.jpg";
import { css } from "@linaria/core";
import { menu } from "@/menu";
import { MenuItems } from "@/components/MenuItems";
import { useCustomTheme } from "@/brand/themes/theme";

interface MobileMenuProps {
	showMobileMenu: boolean;
	toggleMobileMenu: (state: boolean) => void;
	setShowMobileMenu: (state: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
	showMobileMenu,
	toggleMobileMenu,
	setShowMobileMenu
}) => {
	const { colors } = useCustomTheme();

	return (
		<SideSheet
			width="100%"
			isShown={showMobileMenu}
			onCloseComplete={() => toggleMobileMenu(false)}
			preventBodyScrolling
		>
			<Pane
				width="100%"
				height="100%"
				position="absolute"
				style={{
					opacity: 0.3,
					mixBlendMode: "color-burn",
					backgroundSize: "614px",
					backgroundPositionX: "530px",
					backgroundPositionY: "-5px",
					backgroundImage: `url(${BackgroundImage.src}`
				}}
			/>
			<Pane
				background={colors.sidePanel}
				display="flex"
				flexDirection="column"
				justifyContent="space-between"
				width="100%"
				height="100%"
				paddingY="1em"
				paddingX="2em"
				className={css`
					button {
						width: 100%;
						text-align: left;
						display: flex;
						justifycontent: flex-start;
					}
				`}
			>
				<Pane>
					<Pane
						display="flex"
						justifyContent="flex-end"
						className={css`
							button {
								display: flex;
								justify-content: center;
								aling-items: center;
								height: 48px;
								width: 48px;
								padding: 0px;
								margin-bottom: 8px;
								box-shadow: none !important;
							}
						`}
					>
						<Button
							appearance="minimal"
							onClick={() => setShowMobileMenu(false)}
						>
							<CrossIcon size={36} color={colors.aWhite["3"]} />
						</Button>
					</Pane>
					<MenuItems fontSize={22} items={menu.mainItems} />
				</Pane>
				<Pane>
					<MenuItems fontSize={22} isSmall={true} items={menu.footerItems} />
				</Pane>
			</Pane>
		</SideSheet>
	);
};
