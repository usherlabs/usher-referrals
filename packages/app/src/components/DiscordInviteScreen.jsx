import React, { useState } from "react";
import {
	Pane,
	Heading,
	Text,
	Button,
	majorScale,
	Avatar,
	Badge,
	UnorderedList,
	ListItem,
	TickCircleIcon,
	useTheme
} from "evergreen-ui";
import PropTypes from "prop-types";
import Image from "next/image";

import DiscordWhiteIcon from "@/assets/icon/discord-white-icon.svg";

const DicordInviteScreen = ({
	connect,
	usherName,
	usherAvatar,
	guildName,
	guildIcon
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
			>
				<Pane color={colors.gray900} marginRight={6}>
					You've been invited
				</Pane>
				<span>to the</span>
				{/* <Pane
					display="inline-flex"
					borderRadius={100}
					padding={8}
					paddingRight={16}
					alignItems="center"
					justifyContent="center"
					margin={6}
				>
					{guildIcon && (
						<Avatar
							src={guildIcon}
							name={guildName}
							size={40}
							marginRight={8}
						/>
					)}
					<Pane color={colors.purple600}>{guildName}</Pane>
				</Pane> */}
				<Pane display="inline" color={colors.purple600} marginX={6}>
					{guildName}
				</Pane>
				<span>Discord Server by</span>
				{/* <Pane
					display="inline-flex"
					borderRadius={100}
					padding={8}
					paddingRight={16}
					alignItems="center"
					justifyContent="center"
					margin={6}
				>
					{usherAvatar && (
						<Avatar
							src={usherAvatar}
							name={usherName}
							size={40}
							marginRight={8}
						/>
					)}
					<Pane color={colors.blue600}>{usherName}</Pane>
				</Pane> */}
				<Pane display="inline" color={colors.blue600} marginX={6}>
					{usherName}
				</Pane>
			</Heading>
			<Pane background="tint2" padding={16} marginY={12} width="100%">
				<Pane marginBottom={16} display="flex" flexDirection="column">
					<Text marginBottom={6} size={400}>
						To accept:
					</Text>
					<UnorderedList>
						<ListItem icon={TickCircleIcon} iconColor="success">
							<Text>Verify your Discord account</Text>
						</ListItem>
						<ListItem icon={TickCircleIcon} iconColor="success">
							<Text>Accept the Discord invite</Text>
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
