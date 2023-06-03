import { Badge, Pane, Text } from "evergreen-ui";
import Image from "next/image";
import LogoImage from "@/assets/logo/Logo-Icon-White.svg";
import { css } from "@linaria/core";
import * as mediaQueries from "@/utils/media-queries";
import React from "react";
import { useCustomTheme } from "@/brand/themes/theme";

export const SidePanelLogo = () => {
	const { colors } = useCustomTheme();

	return (
		<Pane display="flex" alignItems="center" justifyContent="center">
			<Image src={LogoImage} height={54} width={54} />
			<Text
				fontSize="48px"
				fontWeight={600}
				color={colors.white}
				className={css`
					${mediaQueries.isXSmall} {
						display: none !important;
					}
				`}
			>
				usher
			</Text>
			<Badge color="yellow" marginX={8}>
				ALPHA
			</Badge>
		</Pane>
	);
};
