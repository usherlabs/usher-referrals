import { css } from "@linaria/core";
import { Pane } from "evergreen-ui";
import React from "react";
import BackgroundImage from "@/assets/side-menu-background.jpg";
import Anchor from "@/components/Anchor";
import { menu } from "@/menu";
import * as mediaQueries from "@/utils/media-queries";
import { MenuItems } from "@/components/MenuItems";
import { SidePanelLogo } from "@/brand/logo-components/SidePanelLogo";
import { useCustomTheme } from "@/brand/themes/theme";

type Props = {
	width: number;
};

const SideMenu: React.FC<Props> = ({ width, ...props }) => {
	// Listen for route change and update the new url pathname
	const { colors } = useCustomTheme();

	return (
		<Pane
			position="fixed"
			top={0}
			left={0}
			width={width}
			height="100vh"
			background={colors.sidePanel}
			{...props}
			className={css`
				${mediaQueries.isLarge} {
					display: none !important;
				}
			`}
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
				position="relative"
				display="flex"
				flexDirection="column"
				height="100%"
			>
				<Pane
					display="flex"
					justifyContent="center"
					paddingY={52}
					borderBottom="1px solid rgba(255, 255, 255, 0.1)"
				>
					<Anchor href="/" boxShadow="none !important">
						<SidePanelLogo />
					</Anchor>
				</Pane>
				<Pane
					height="100%"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					overflow="auto"
					paddingY={20}
					paddingX={30}
					className={css`
						${mediaQueries.isLarge} {
							display: none !important;
						}
					`}
				>
					<Pane>
						<MenuItems items={menu.mainItems} />
					</Pane>
					<Pane>
						<MenuItems isSmall={true} items={menu.footerItems} />
					</Pane>
				</Pane>
			</Pane>
		</Pane>
	);
};

SideMenu.defaultProps = {};

export default SideMenu;
