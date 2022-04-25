import React, { useState } from "react";
import {
	Pane,
	Heading,
	Text,
	Button,
	majorScale,
	Avatar,
	UnorderedList,
	ListItem,
	TickCircleIcon,
	useTheme,
	Tooltip
} from "evergreen-ui";
import PropTypes from "prop-types";
import Image from "next/image";

import DiscordWhiteIcon from "@/assets/icon/discord-white-icon.svg";

const DicordInviteScreen = ({
	connect,
	usherName,
	usherAvatar,
	guildName,
	guildIcon,
	channelName
}) => {
	const [isLoading, setLoading] = useState(false);
	const { colors } = useTheme();

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="flex-start"
			justifyContent="center"
			padding={16}
			maxWidth={800}
			margin="auto"
			width="100%"
		>
			<Heading
				is="h1"
				size={900}
				display="flex"
				alignItems="center"
				flexWrap="wrap"
				color={colors.gray600}
				marginBottom={8}
			>
				<Pane color={colors.gray900} marginRight={6}>
					You've been invited
				</Pane>
				<span>to the</span>
				<Tooltip
					content={
						<Pane
							display="flex"
							alignItems="center"
							justifyContent="center"
							flexDirection="row"
						>
							{guildIcon && (
								<Avatar src={guildIcon} size={40} marginRight={8} />
							)}
							<Text size={400} color="white">
								The&nbsp;
								<strong>{channelName}</strong> channel is ready for you
							</Text>
						</Pane>
					}
					statelessProps={{
						elevation: 4,
						borderRadius: 100,
						paddingLeft: 10
					}}
				>
					<Pane
						display="inline"
						color={colors.purple600}
						marginX={6}
						borderBottom
						borderBottomStyle="dashed"
						borderBottomColor={colors.purple600}
					>
						{guildName}
					</Pane>
				</Tooltip>
				<span>Discord Server by</span>
				<Tooltip
					content={
						<Pane
							display="flex"
							alignItems="center"
							justifyContent="center"
							flexDirection="row"
						>
							{usherAvatar && (
								<Avatar src={usherAvatar} size={40} marginRight={8} />
							)}
							<Text color="white">👋 👋&nbsp;&nbsp;See you inside!</Text>
						</Pane>
					}
					statelessProps={{
						elevation: 4,
						borderRadius: 100,
						paddingLeft: 10
					}}
				>
					<Pane
						display="inline"
						color={colors.blue500}
						marginX={6}
						borderBottom
						borderBottomStyle="dashed"
						borderBottomColor={colors.blue500}
					>
						{usherName}
					</Pane>
				</Tooltip>
			</Heading>
			<Pane
				background="tint2"
				padding={16}
				marginY={12}
				width="100%"
				maxWidth={400}
				borderRadius={8}
				elevation={1}
			>
				<Pane marginBottom={16} display="flex" flexDirection="column">
					<Text
						marginBottom={6}
						size={300}
						textTransform="uppercase"
						fontWeight={900}
						color={colors.gray600}
					>
						To accept:
					</Text>
					<UnorderedList>
						<ListItem icon={TickCircleIcon} iconColor="success" size={500}>
							Verify your Discord account
						</ListItem>
						<ListItem icon={TickCircleIcon} iconColor="success" size={500}>
							Accept the Discord invite
						</ListItem>
					</UnorderedList>
				</Pane>
				<Button
					height={majorScale(7)}
					appearance="primary"
					isLoading={isLoading}
					iconBefore={<Image src={DiscordWhiteIcon} width={20} height={20} />}
					onClick={(e) => {
						setLoading(true);
						connect(e).finally(() => setLoading(false));
					}}
					minWidth={260}
					width="100%"
				>
					<strong>Verify with Discord</strong>
				</Button>
			</Pane>
		</Pane>
	);
};

DicordInviteScreen.propTypes = {
	connect: PropTypes.func.isRequired,
	usherName: PropTypes.string.isRequired,
	usherAvatar: PropTypes.string.isRequired,
	guildName: PropTypes.string.isRequired,
	guildIcon: PropTypes.string.isRequired,
	channelName: PropTypes.string.isRequired
};

export default DicordInviteScreen;
