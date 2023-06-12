import { Badge, Pane } from "evergreen-ui";
import Image from "next/future/image";
import React from "react";
import { BrandLogoLight } from "@/brand/logo-components/BrandLogos";
import { brandConfig } from "@/brand";

export const SidePanelLogo = () => {
	return (
		<Pane
			display="flex"
			width="100%"
			alignItems="center"
			justifyContent="center"
		>
			{brandConfig.rebranded ? (
				<Image
					alt="logo"
					height={54}
					src={BrandLogoLight}
					style={{ height: "54px", width: "auto", padding: "2px 0px" }}
				/>
			) : (
				<>
					<Image
						alt="logo"
						src={BrandLogoLight}
						style={{ height: "54px", width: "auto", padding: "2px 0px" }}
					/>
					<Badge color="yellow" marginX={8}>
						ALPHA
					</Badge>
				</>
			)}
		</Pane>
	);
};
