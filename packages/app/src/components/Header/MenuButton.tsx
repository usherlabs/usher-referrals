import React from "react";
import { Button } from "evergreen-ui";
import { css, cx } from "@linaria/core";
import * as mediaQueries from "@/utils/media-queries";

export const MenuButton = ({
	height,
	children,
	...restProps
}: React.PropsWithChildren<{
	height: number;
}> &
	React.ComponentProps<typeof Button>) => {
	const menuButtonProps = {
		appearance: "minimal",
		paddingX: 0,
		width: height,
		height,
		boxShadow: "none !important",
		className: cx(
			css`
				:hover svg {
					fill: #000 !important;
				}

				${mediaQueries.isLarge} {
					width: auto;
					padding-left: 10px;
					padding-right: 10px;
				}
			`,
			restProps.className
		)
	};

	return (
		<Button {...menuButtonProps} {...restProps}>
			{children}
		</Button>
	);
};
