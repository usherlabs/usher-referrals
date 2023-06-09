import React from "react";
import { Badge, Pane } from "evergreen-ui";
import Image from "next/future/image";
import { BrandLogoDark } from "@/brand/logo-components/BrandLogos";
import { brandConfig } from "@/brand";

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
				<Image
					alt="logo"
					height={height - 32}
					style={{ width: "auto" }}
					src={BrandLogoDark}
				/>
			) : (
				<>
					<Image
						alt="logo"
						height={height - 32}
						style={{ width: "auto" }}
						src={BrandLogoDark}
					/>
					<Badge color="yellow" marginX={8}>
						ALPHA
					</Badge>
				</>
			)}
		</Pane>
	);
};
