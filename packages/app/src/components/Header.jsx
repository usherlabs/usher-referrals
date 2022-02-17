import React from "react";
import Image from "next/image";
import { Pane, Heading, Button, majorScale } from "evergreen-ui";

const Header = () => {
	return (
		<Pane
			display="flex"
			padding={16}
			background="tint2"
			borderRadius={8}
			width="100%"
			alignItems="center"
		>
			<Pane flex={1} alignItems="center" display="flex">
				<Pane
					border
					padding={8}
					marginRight={12}
					backgroundColor="white"
					borderRadius={8}
				>
					<Image
						src="/static/logo/Logo-Icon-Light.png"
						width={40}
						height={40}
					/>
				</Pane>
				<Heading size={600}>Usher</Heading>
			</Pane>
			<Pane>
				{/* Below you can see the marginRight property on a Button. */}
				<Button marginRight={16} height={majorScale(5)}>
					Button
				</Button>
				<Button appearance="primary" height={majorScale(5)}>
					Primary Button
				</Button>
			</Pane>
		</Pane>
	);
};

export default Header;
