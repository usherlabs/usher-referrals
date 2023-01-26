import { css, cx } from "@linaria/core";
import { Badge, Button, Label, Pane, Text, useTheme } from "evergreen-ui";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import LogoImage from "@/assets/logo/Logo-Icon-White.svg";
import BackgroundImage from "@/assets/side-menu-background.jpg";
import Anchor from "@/components/Anchor";
import { useUser } from "@/hooks";
import { menu, MenuItem } from "@/menu";
import * as mediaQueries from "@/utils/media-queries";

type Props = {
	width: number;
};

const SideMenu: React.FC<Props> = ({ width, ...props }) => {
	const { colors } = useTheme();
	const [currentPathname, setCurrentPathname] = useState("");
	const router = useRouter();
	const { isAuthenticated } = useUser();

	// Listen for route change and update the new url pathname
	const onRouteChangeComplete = useCallback(
		(url: string) => {
			if (url !== currentPathname) {
				setCurrentPathname(url);
			}
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
			return items
				.filter((item) => !item.isSecured || isAuthenticated)
				.map((item) => (
					<Anchor
						key={item.text}
						href={item.href}
						external={item.isExternal || false}
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
		[currentPathname, isAuthenticated]
	);

	const mainMenu = buildMenu(menu.mainItems);
	const footerMenu = buildMenu(menu.footerItems, true);

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
		</Pane>
	);
};

SideMenu.defaultProps = {};

export default SideMenu;
