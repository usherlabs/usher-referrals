import React, { useState, useCallback } from "react";
import Image from "next/image";
import isEmpty from "lodash/isEmpty";
import {
	Pane,
	Heading,
	Button,
	majorScale,
	ChevronDownIcon,
	LogOutIcon,
	Popover,
	Position,
	Menu,
	Avatar,
	UserIcon
} from "evergreen-ui";

import flip from "@/utils/props-flip";

import LogoImage from "@/assets/logo/Logo-Icon.svg";
import DiscordIcon from "@/assets/icon/discord-icon.svg";
import ArConnectIcon from "@/assets/icon/arconnect.svg";
import { MAX_SCREEN_WIDTH, SKIPPED_WALLET_ADDRESS } from "@/constants";

export type Props = {
	walletAddress: string;
	userProvider?: string;
	username: string;
	avatarUrl?: string;
	disconnect: () => void;
	signOut: () => Promise<void>;
};

const Header: React.FC<Props> = ({
	walletAddress,
	userProvider,
	username,
	avatarUrl,
	disconnect,
	signOut
}) => {
	const [isLoading, setLoading] = useState(false);
	const signOutHandler = useCallback(async () => {
		setLoading(true);
		await signOut();
		setLoading(false);
		// State is set in Auth Update.
	}, []);

	return (
		<Pane
			padding={16}
			width="100%"
			background={isEmpty(walletAddress) ? "white" : "tint2"}
			{...flip(isEmpty(walletAddress) || isEmpty(userProvider), {
				position: ["absolute", null],
				left: [0, null],
				right: [0, null]
			})}
		>
			<Pane
				maxWidth={MAX_SCREEN_WIDTH}
				marginX="auto"
				display="flex"
				alignItems="center"
			>
				<Pane
					flex={1}
					alignItems="center"
					display="flex"
					justifyContent={isEmpty(walletAddress) ? "center" : "flex-start"}
				>
					<Pane
						border
						marginRight={12}
						backgroundColor="white"
						borderRadius={8}
						display="flex"
						alignItems="center"
					>
						<Image src={LogoImage} width={56} height={56} />
					</Pane>
					<Heading size={600}>Usher</Heading>
				</Pane>
				{!isEmpty(walletAddress) && (
					<Pane>
						{!isEmpty(userProvider) && (
							<Popover
								position={Position.BOTTOM_LEFT}
								content={
									<Menu>
										{userProvider === "email" && (
											<Menu.Item pointerEvents="none">{username}</Menu.Item>
										)}
										<Menu.Item icon={LogOutIcon} onClick={signOutHandler}>
											Disconnect
										</Menu.Item>
									</Menu>
								}
							>
								<Button
									marginRight={16}
									height={majorScale(5)}
									borderRadius={40}
									iconBefore={
										userProvider === "discord" ? (
											<Image src={DiscordIcon} width={20} height={20} />
										) : (
											<UserIcon size={24} />
										)
									}
									iconAfter={ChevronDownIcon}
									isLoading={isLoading}
								>
									{!isEmpty(avatarUrl) && (
										<Avatar
											src={avatarUrl}
											size={30}
											name={username}
											marginRight={8}
										/>
									)}
									<strong>
										{userProvider === "email" ? `Account` : username}
									</strong>
								</Button>
							</Popover>
						)}
						{walletAddress === SKIPPED_WALLET_ADDRESS ? (
							<Button
								appearance="primary"
								intent="danger"
								height={majorScale(5)}
								borderRadius={40}
								iconBefore={
									<Image src={ArConnectIcon} width={25} height={25} />
								}
								isLoading={isLoading}
							>
								<strong>Connect your Wallet</strong>
							</Button>
						) : (
							<Popover
								position={Position.BOTTOM_LEFT}
								content={
									<Menu>
										<Menu.Item
											icon={LogOutIcon}
											onClick={() => {
												setLoading(true);
												disconnect();
												setLoading(false);
											}}
										>
											Disconnect
										</Menu.Item>
									</Menu>
								}
							>
								<Button
									appearance="primary"
									height={majorScale(5)}
									borderRadius={40}
									iconBefore={
										<Image src={ArConnectIcon} width={25} height={25} />
									}
									iconAfter={ChevronDownIcon}
									isLoading={isLoading}
								>
									<strong>
										Wallet{" "}
										{walletAddress.substring(
											walletAddress.length - 4,
											walletAddress.length
										)}
									</strong>
								</Button>
							</Popover>
						)}
					</Pane>
				)}
			</Pane>
		</Pane>
	);
};

Header.defaultProps = {
	walletAddress: "",
	userProvider: "",
	username: "",
	avatarUrl: ""
};

export default Header;
