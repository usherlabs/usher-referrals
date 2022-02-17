import React from "react";
import Image from "next/image";
import PropTypes from "prop-types";
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
	Menu
} from "evergreen-ui";

import flip from "@/utils/props-flip";

const Header = ({
	walletAddress,
	username,
	disconnectService,
	disconnectWallet
}) => {
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
					{!isEmpty(username) && (
						<Popover
							position={Position.BOTTOM_LEFT}
							content={
								<Menu>
									<Menu.Item icon={LogOutIcon} onClick={disconnectService}>
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
									<Image
										src="/static/icon/discord-icon.svg"
										width={20}
										height={20}
									/>
								}
								iconAfter={ChevronDownIcon}
							>
								<strong>{username}</strong>
							</Button>
						</Popover>
					)}
					<Popover
						position={Position.BOTTOM_LEFT}
						content={
							<Menu>
								<Menu.Item icon={LogOutIcon} onClick={disconnectWallet}>
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
								<Image
									src="/static/asset/arconnect-logo.svg"
									width={25}
									height={25}
								/>
							}
							iconAfter={ChevronDownIcon}
						>
							<strong>
								Account{" "}
								{walletAddress.substring(
									walletAddress.length - 4,
									walletAddress.length
								)}
							</strong>
						</Button>
					</Popover>
				</Pane>
			)}
		</Pane>
	);
};

Header.propTypes = {
	walletAddress: PropTypes.string,
	username: PropTypes.string,
	disconnectService: PropTypes.func,
	disconnectWallet: PropTypes.func
};

Header.defaultProps = {
	walletAddress: "",
	username: "",
	disconnectService() {},
	disconnectWallet() {}
};

export default Header;
