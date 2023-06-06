import React from "react";
import { Badge, Pane } from "evergreen-ui";
import Image from "next/future/image";
import { BrandLogomarkDark, BrandLogomarkLight } from "@/brand/logo/BrandLogo";
import { brandConfig } from "@/brand/config-reader";

interface MainLogoProps {
	height: number;
}

export const MobileHeaderLogo: React.FC<MainLogoProps> = ({ height }) => {
	return (
		<Pane
			alignItems="center"
			display="grid"
			gridAutoFlow={"column"}
			justifyContent="flex-start"
			paddingLeft={16}
			paddingY={8}
		>
			{brandConfig.rebranded ? (
				<Image alt="logo" height={height - 32} src={BrandLogomarkDark} />
			) : (
				<>
					<Image alt="logo" height={height - 32} src={BrandLogomarkDark} />
					<Badge color="yellow" marginX={8}>
						ALPHA
					</Badge>
				</>
			)}
		</Pane>
	);
};
