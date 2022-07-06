import React from "react";
import { Pane, Label, Paragraph } from "evergreen-ui";
import { css } from "@linaria/core";

import Anchor from "@/components/Anchor";
import * as mediaQueries from "@/utils/media-queries";

const menu = [
	{
		href: "https://docs.usher.so/?ref=app",
		text: "Documentation",
		external: true
	}
	// {
	// 	href: "https://docs.usher.so/?ref=app",
	// 	text: "Terms & Conditions",
	// 	external: true
	// }
];

const Footer: React.FC = ({ ...props }) => {
	return (
		<Pane width="100%" {...props}>
			<Pane
				marginX="auto"
				display="flex"
				alignItems="center"
				justifyContent="center"
				flexDirection="column"
				paddingY={8}
			>
				<Pane paddingX={8} paddingY={4}>
					<Pane
						className={css`
							flex-direction: row;
							${mediaQueries.isLarge} {
								flex-direction: column !important;
							}
						`}
					>
						{menu.map((item) => (
							<Anchor
								key={item.text}
								href={item.href}
								external={item.external || false}
								color="#000000"
								opacity={0.7}
								className={css`
									:hover {
										opacity: 1 !important;
										text-decoration: underline;
									}
								`}
								marginX={8}
							>
								<Label size={400} fontWeight={700} pointerEvents="none">
									{item.text}
								</Label>
							</Anchor>
						))}
					</Pane>
				</Pane>
				<Pane paddingY={4}>
					<Paragraph size={300}>&copy; 2022 Usher Labs Pty Ltd</Paragraph>
				</Pane>
			</Pane>
		</Pane>
	);
};

Footer.defaultProps = {};

export default Footer;
