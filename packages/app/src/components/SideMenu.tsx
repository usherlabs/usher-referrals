import {
	UilArrowGrowth,
	UilBookAlt,
	UilComments,
	UilDiscord,
	UilGithub,
	UilLink,
	UilStar,
	UilUsersAlt
} from "@iconscout/react-unicons";
import { css, cx } from "@linaria/core";
import { Badge, Button, Label, Pane, Text, useTheme } from "evergreen-ui";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { ReactElement, useCallback, useEffect, useState } from "react";

import LogoImage from "@/assets/logo/Logo-Icon-White.svg";
import BackgroundImage from "@/assets/side-menu-background.jpg";
import Anchor from "@/components/Anchor";
import SideSheet from "@/components/SideSheet";
import * as mediaQueries from "@/utils/media-queries";

type Props = {
	width: number;
};

type MenuItem = {
	href: string;
	text: string;
	icon?: ReactElement;
	external?: boolean;
};

const mainItems: MenuItem[] = [
	{
		href: "/collections",
		text: "Collections",
		icon: <UilLink size={28} />
	},
	{
		href: "/conversions",
		text: "Conversions",
		icon: <UilComments size={28} />
	},
	{
		href: "/",
		text: "Partnerships",
		icon: <UilUsersAlt size={28} />
	},
	{
		href: "/explore",
		text: "Campaigns",
		icon: <UilArrowGrowth size={28} />
	}
];

const footerItems: MenuItem[] = [
	{
		href: "https://usher.so/?ref=app",
		text: "About",
		icon: <UilStar size={28} />,
		external: true
	},
	{
		href: "https://docs.usher.so/?ref=app",
		text: "Docs",
		icon: <UilBookAlt size={28} />,
		external: true
	},
	{
		href: "https://go.usher.so/discord",
		text: "Discord",
		icon: <UilDiscord size={28} />,
		external: true
	},
	{
		href: "https://github.com/usherlabs",
		text: "GitHub",
		icon: <UilGithub size={28} />,
		external: true
	}
];

const SideMenu: React.FC<Props> = ({ width, ...props }) => {
	const { colors } = useTheme();
	const [currentPathname, setCurrentPathname] = useState("");
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const router = useRouter();

	// Listen for route change and update the new url pathname
	const onRouteChangeComplete = useCallback(
		(url: string) => {
			if (url !== currentPathname) {
				setCurrentPathname(url);
			}
			setShowMobileMenu(false);
		},
		[currentPathname]
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setCurrentPathname(window.location.pathname);
		}

		router.events.on("routeChangeComplete", onRouteChangeComplete);
		return () => {
			router.events.off("routeChangeComplete", onRouteChangeComplete);
		};
	}, []);

	const buildMenu = useCallback(
		(items: MenuItem[], isSmall = false) => {
			return items.map((item) => (
				<Anchor
					key={item.text}
					href={item.href}
					external={item.external || false}
				>
					<Button
						appearance="minimal"
						borderRadius="10px"
						boxShadow="none !important"
						width="100%"
						height={isSmall ? 42 : 52}
						display="flex"
						justifyContent="start"
						className={cx(
							css`
								:hover label {
									color: #000 !important;
								}
							`,
							currentPathname === item.href
								? css`
										 {
											background-color: #ffffff;
										}
								  `
								: ""
						)}
						iconBefore={item.icon}
						marginBottom={1}
					>
						<Label
							fontSize={isSmall ? 16 : 20}
							fontWeight={400}
							color="#7F92A4"
							pointerEvents="none"
						>
							{item.text}
						</Label>
					</Button>
				</Anchor>
			));
		},
		[currentPathname]
	);

	const mainMenu = buildMenu(mainItems);
	const footerMenu = buildMenu(footerItems, true);

	return (
		<Pane
			position="fixed"
			top={0}
			left={0}
			width={width}
			height="100vh"
			background="#0A1B30"
			{...props}
			className={css`
				${mediaQueries.isLarge} {
					display: none !important;
				}
			`}
		>
			<Pane
				width="100%"
				height="100%"
				position="absolute"
				style={{
					opacity: 0.3,
					mixBlendMode: "color-burn",
					backgroundSize: "614px",
					backgroundPositionX: "530px",
					backgroundPositionY: "-5px",
					backgroundImage: `url(${BackgroundImage.src}`
				}}
			/>
			<Pane
				position="relative"
				display="flex"
				flexDirection="column"
				height="100%"
			>
				<Pane
					display="flex"
					justifyContent="center"
					paddingY={52}
					borderBottom="1px solid rgba(255, 255, 255, 0.1)"
				>
					<Anchor href="/" boxShadow="none !important">
						<Pane display="flex" alignItems="center" justifyContent="center">
							<Image src={LogoImage} height={54} width={54} />
							<Text
								fontSize="48px"
								fontWeight={600}
								color={colors.white}
								className={css`
									${mediaQueries.isXSmall} {
										display: none !important;
									}
								`}
							>
								usher
							</Text>
							<Badge color="yellow" marginX={8}>
								ALPHA
							</Badge>
						</Pane>
					</Anchor>
				</Pane>
				<Pane
					height="100%"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					overflow="auto"
					paddingY={20}
					paddingX={30}
					className={css`
						${mediaQueries.isLarge} {
							display: none !important;
						}
					`}
				>
					<Pane>{mainMenu}</Pane>
					<Pane>{footerMenu}</Pane>
				</Pane>
			</Pane>
			<SideSheet
				isShown={showMobileMenu}
				onCloseComplete={() => setShowMobileMenu(false)}
				preventBodyScrolling
			>
				<Pane
					display="flex"
					flexDirection="column"
					width="100%"
					className={css`
						button {
							width: 100%;
							text-align: left;
							display: flex;
							justify-content: flex-start;
						}
					`}
				>
					{mainMenu}
					{footerMenu}
				</Pane>
			</SideSheet>
		</Pane>
	);
};

SideMenu.defaultProps = {};

export default SideMenu;
