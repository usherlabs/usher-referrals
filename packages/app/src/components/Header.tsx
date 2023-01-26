import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import { UilUserCircle, UilWallet } from "@iconscout/react-unicons";
import { css, cx } from "@linaria/core";
import {
	Badge,
	Button,
	CogIcon,
	Heading,
	CrossIcon,
	Label,
	LogOutIcon,
	Menu,
	MenuIcon,
	Pane,
	Popover,
	Position,
	SideSheet,
	Spinner,
	useTheme
} from "evergreen-ui";
import { useRouter } from "next/router";

import LogoImage from "@/assets/logo/Logo-Icon.svg";
import BackgroundImage from "@/assets/side-menu-background.jpg";
import Anchor from "@/components/Anchor";
import { useUser, useWindowSize } from "@/hooks";
import useRedir from "@/hooks/use-redir";
import { menu, MenuItem } from "@/menu";
import { Breakpoints } from "@/types";
import * as mediaQueries from "@/utils/media-queries";

type Props = {
	height: number;
	walletCount: number;
	onWalletClick: () => void;
	onSettingsClick: () => void;
	onLogoutClick: () => void;
};

const Header: React.FC<Props> = ({
	height,
	walletCount,
	onWalletClick,
	onSettingsClick,
	onLogoutClick,
	...props
}) => {
	const windowSize = useWindowSize();
	const { colors } = useTheme();
	const {
		user: { wallets },
		isLoading: isWalletLoading
	} = useUser();
	const [currentPathname, setCurrentPathname] = useState("");
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const loginUrl = useRedir("/login");
	const router = useRouter();
	const { isAuthenticated } = useUser();

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
						>
							<Label
								fontSize="22px"
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

	useEffect(() => {
		if (showMobileMenu && windowSize.width > Breakpoints.large) {
			setShowMobileMenu(false);
		}
	}, [windowSize]);

	const menuButtonProps = {
		appearance: "minimal",
		paddingX: 0,
		width: height,
		height,
		boxShadow: "none !important",
		className: css`
			:hover svg {
				fill: #000 !important;
			}
			${mediaQueries.isLarge} {
				width: auto;
				padding-left: 10px;
				padding-right: 10px;
			}
		`
	};

	const ProfileButton = (
		<Button {...menuButtonProps}>
			<UilUserCircle size="32" color={colors.gray700} />
		</Button>
	);

	return (
		<Pane width="100%" height={height} {...props}>
			<Pane
				marginX="auto"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Anchor
					href="/"
					className={css`
						${mediaQueries.gtLarge} {
							display: none !important;
						}
					`}
				>
					<Pane
						alignItems="center"
						display="flex"
						justifyContent="flex-start"
						paddingLeft={16}
						paddingY={8}
					>
						<Pane
							border
							backgroundColor="white"
							borderRadius={8}
							display="flex"
							alignItems="center"
						>
							<Image src={LogoImage} height={height - 16} width={height - 16} />
						</Pane>
						<Heading
							marginLeft={12}
							size={600}
							color={colors.gray900}
							className={css`
								${mediaQueries.isXSmall} {
									display: none !important;
								}
							`}
						>
							usher
						</Heading>
						<Badge color="yellow" marginX={8}>
							ALPHA
						</Badge>
					</Pane>
				</Anchor>
				<Pane
					display="flex"
					paddingX={16}
					className={css`
						${mediaQueries.isXSmall} {
							padding-left: 0px;
						}
					`}
				>
					{wallets.length === 0 ? (
						<Anchor href={loginUrl}>{ProfileButton}</Anchor>
					) : (
						<Popover
							position={Position.BOTTOM_RIGHT}
							content={
								<Menu>
									<Menu.Group>
										<Menu.Item icon={CogIcon} onClick={onSettingsClick}>
											Settings
										</Menu.Item>
										<Menu.Item icon={LogOutIcon} onClick={onLogoutClick}>
											Log Out
										</Menu.Item>
									</Menu.Group>
								</Menu>
							}
						>
							{ProfileButton}
						</Popover>
					)}
					<Button {...menuButtonProps} onClick={onWalletClick}>
						<UilWallet size="32" color={colors.gray700} />
						{walletCount > 0 && (
							<Label
								position="absolute"
								top="5px"
								right="5px"
								width="20px"
								height="20px"
								fontWeight={900}
								backgroundColor={colors.blue500}
								color="#fff"
								borderRadius={100}
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								{walletCount}
							</Label>
						)}
						{isWalletLoading && (
							<Pane position="absolute" bottom="7.5px" right="7.5px">
								<Spinner size={16} />
							</Pane>
						)}
					</Button>
					<Button
						{...menuButtonProps}
						onClick={() => setShowMobileMenu(true)}
						className={cx(
							menuButtonProps.className,
							css`
								${mediaQueries.gtLarge} {
									display: none !important;
								}
							`
						)}
					>
						<MenuIcon size={32} />
					</Button>
				</Pane>
			</Pane>
			<SideSheet
				width="100%"
				isShown={showMobileMenu}
				onCloseComplete={() => setShowMobileMenu(false)}
				preventBodyScrolling
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
					background="#0A1B30"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					width="100%"
					height="100%"
					paddingY="1em"
					paddingX="2em"
					className={css`
						button {
							width: 100%;
							text-align: left;
							display: flex;
							justify-content: flex-start;
						}
					`}
				>
					<Pane>
						<Pane
							display="flex"
							justifyContent="flex-end"
							className={css`
								button {
									display: flex;
									justify-content: center;
									aling-items: center;
									height: 48px;
									width: 48px;
									padding: 0px;
									margin-bottom: 8px;
								}
							`}
						>
							<Button
								appearance="minimal"
								onClick={() => setShowMobileMenu(false)}
							>
								<CrossIcon size={36} color={colors.gray700} />
							</Button>
						</Pane>
						{mainMenu}
					</Pane>
					<Pane>{footerMenu}</Pane>
				</Pane>
			</SideSheet>
		</Pane>
	);
};

Header.defaultProps = {
	walletCount: 0
};

export default Header;
