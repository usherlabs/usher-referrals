import React from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import { Pane, Heading, Button, majorScale } from "evergreen-ui";
import Link from "next/link";

import flip from "@/utils/props-flip";

const Header = ({ walletAddress }) => {
	return (
		<Pane
			display="flex"
			padding={16}
			borderRadius={8}
			width="100%"
			alignItems="center"
			{...flip(isEmpty(walletAddress), {
				background: ["white", "tint2"],
				position: ["absolute", null],
				left: [0, null],
				right: [0, null]
			})}
		>
			<Pane
				flex={1}
				alignItems="center"
				display="flex"
				justifyContent={isEmpty(walletAddress) ? "center" : "flex-start"}
			>
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
			{!isEmpty(walletAddress) && (
				<Pane>
					{/* Below you can see the marginRight property on a Button. */}
					<Button marginRight={16} height={majorScale(5)}>
						Button
					</Button>
					<Button appearance="primary" height={majorScale(5)}>
						Primary Button
					</Button>
				</Pane>
			)}
		</Pane>
	);
};

Header.propTypes = {
	walletAddress: PropTypes.string
};

Header.defaultProps = {
	walletAddress: ""
};

export default Header;
