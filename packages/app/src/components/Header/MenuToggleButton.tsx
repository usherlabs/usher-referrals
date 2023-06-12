import React from "react";
import { MenuIcon } from "evergreen-ui";
import { MenuButton } from "@/components/Header/MenuButton";
import { css } from "@linaria/core";
import * as mediaQueries from "@/utils/media-queries";

interface MenuButtonProps {
	height: number;
	toggleMobileMenu: (state: boolean) => void;
}

export const MenuToggleButton: React.FC<MenuButtonProps> = ({
	height,
	toggleMobileMenu
}) => {
	return (
		<MenuButton
			height={height}
			className={css`
				${mediaQueries.gtLarge} {
					display: none !important;
				}
			`}
			onClick={() => toggleMobileMenu(true)}
		>
			<MenuIcon size={32} />
		</MenuButton>
	);
};
