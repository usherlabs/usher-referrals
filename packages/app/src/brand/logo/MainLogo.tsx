import React from "react";
import { Badge, Heading, Pane } from "evergreen-ui";
import { css } from "@linaria/core";
import LogoImage from "@/assets/logo/Logo-Icon.svg";
import Image from "next/image";
import * as mediaQueries from "@/utils/media-queries";
import { useCustomTheme } from "@/brand/themes/theme";

interface MainLogoProps {
	height: number;
}

export const MainLogo: React.FC<MainLogoProps> = ({ height }) => {
	const { colors } = useCustomTheme();

	return (
		<Pane
			alignItems="center"
			display="flex"
			justifyContent="flex-start"
			paddingLeft={16}
			paddingY={8}
		>
			<Pane
				border
				backgroundColor="white"
				borderRadius={8}
				display="flex"
				alignItems="center"
			>
				<Image src={LogoImage} height={height - 16} width={height - 16} />
			</Pane>
			<Heading
				marginLeft={12}
				size={600}
				color={colors.gray900}
				className={css`
					${mediaQueries.isXSmall} {
						display: none !important;
					}
				`}
			>
				usher
			</Heading>
			<Badge color="yellow" marginX={8}>
				ALPHA
			</Badge>
		</Pane>
	);
};
