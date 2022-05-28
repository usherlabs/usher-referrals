import React from "react";
import Image from "next/image";
import { Pane, Heading, Button, useTheme, Label } from "evergreen-ui";
import { UilUserCircle, UilWallet } from "@iconscout/react-unicons";
import { css } from "@linaria/core";

import Anchor from "@/components/Anchor";

import LogoImage from "@/assets/logo/Logo-Icon.svg";

type Props = {
	height: number;
};

const menu = [
	{
		href: "/",
		text: "My Partnerships"
	},
	{
		href: "/explore",
		text: "Explore"
	},
	{
		href: "https://go.usher.so/register",
		text: "Start a Campaign",
		external: true
	}
];

const Header: React.FC<Props> = ({ height, ...props }) => {
	const { colors } = useTheme();

	return (
		<Pane width="100%" background="tint2" height={height} {...props}>
			<Pane
				marginX="auto"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Anchor href="/">
					<Pane
						alignItems="center"
						display="flex"
						justifyContent="flex-start"
						paddingX={16}
						paddingY={8}
					>
						<Pane
							border
							marginRight={12}
							backgroundColor="white"
							borderRadius={8}
							display="flex"
							alignItems="center"
						>
							<Image src={LogoImage} height={height - 16} width={height - 16} />
						</Pane>
						<Heading size={600} color={colors.gray900}>
							Usher
						</Heading>
					</Pane>
				</Anchor>
				<Pane paddingX={16}>
					{menu.map((item) => (
						<Anchor key={item.text} href={item.href}>
							<Button
								appearance="minimal"
								height={height}
								boxShadow="none !important"
								className={css`
									:hover label {
										color: #000 !important;
									}
								`}
							>
								<Label size={500} color={colors.gray800} pointerEvents="none">
									{item.text}
								</Label>
							</Button>
						</Anchor>
					))}
					<Button
						appearance="minimal"
						paddingX={0}
						width={height}
						height={height}
						boxShadow="none !important"
						className={css`
							:hover svg {
								fill: #000 !important;
							}
						`}
					>
						<UilUserCircle size="32" color={colors.gray700} />
					</Button>
					<Button
						appearance="minimal"
						paddingX={0}
						width={height}
						height={height}
						boxShadow="none !important"
						className={css`
							:hover svg {
								fill: #000 !important;
							}
						`}
					>
						<UilWallet size="32" color={colors.gray700} />
					</Button>
				</Pane>
			</Pane>
		</Pane>
	);
};

export default Header;
