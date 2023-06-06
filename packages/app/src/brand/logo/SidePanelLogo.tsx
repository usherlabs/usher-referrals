import { Badge, Pane } from "evergreen-ui";
import Image from "next/future/image";
import React from "react";
import { BrandLogoLight } from "@/brand/logo/BrandLogos";
import { brandConfig } from "@/brand/config-reader";

export const SidePanelLogo = () => {
	return (
		<Pane display="flex" alignItems="center" justifyContent="center">
			{brandConfig.rebranded ? (
				<Image
					alt="logo"
					height={54}
					src={BrandLogoLight}
					style={{ padding: "2px 0px" }}
				/>
			) : (
				<>
					<Image
						alt="logo"
						height={54}
						src={BrandLogoLight}
						style={{ padding: "2px 0px" }}
					/>
					<Badge color="yellow" marginX={8}>
						ALPHA
					</Badge>
				</>
			)}
		</Pane>
	);
};
