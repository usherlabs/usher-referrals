import React from "react";
import { Label, Pane, Paragraph } from "evergreen-ui";
import { css } from "@linaria/core";

import Anchor from "@/components/Anchor";
import * as mediaQueries from "@/utils/media-queries";
import { useCustomTheme } from "@/brand/themes/theme";

const menu = [
	{
		href: "https://usher.so/?ref=app",
		text: "About",
		external: true
	},
	{
		href: "https://docs.usher.so/?ref=app",
		text: "Docs",
		external: true
	},
	{
		href: "https://go.usher.so/discord",
		text: "Discord",
		external: true
	}
];

const Footer: React.FC = ({ ...props }) => {
	const { colors } = useCustomTheme();
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
								color={colors.gray900}
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
