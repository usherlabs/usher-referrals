import { Pane, Text } from "evergreen-ui";
import Image from "next/future/image";
import UsherLogoDark from "@/assets/usher-logos/usher-logo-dark.svg";
import React from "react";
import Anchor from "@/components/Anchor";

export const PoweredByUsher = () => {
	return (
		<Pane display="flex" flexDirection="column" alignItems={"center"}>
			<Text
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				fontSize={"0.8em"}
			>
				partnerships technology powered by{" "}
				<Anchor
					target="_blank"
					display={"flex"}
					href={"https://usher.so/?ref=app"}
				>
					<Image
						alt="logo"
						height={16}
						src={UsherLogoDark}
						style={{ margin: 4, opacity: 0.85, width: "auto" }}
					/>
				</Anchor>
				— alpha release.
			</Text>
			{/* <Text fontSize={"0.8em"}>Please refer responsibly.</Text> */}
		</Pane>
	);
};
