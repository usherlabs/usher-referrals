import React, { useState } from "react";
import {
	Pane,
	Heading,
	Text,
	Button,
	majorScale,
	Avatar,
	Badge,
	StatusIndicator
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

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="flex-start"
			justifyContent="center"
			padding={32}
			maxWidth={600}
			margin="auto"
			width="100%"
		>
			<Heading is="h1" size={800} marginBottom={16}>
				You've been invited to...
			</Heading>
			<Pane
				border
				borderColor="gray400"
				elevation={2}
				padding={16}
				borderRadius={6}
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="center"
				width="100%"
			>
				<Pane
					display="flex"
					justifyContent="center"
					marginBottom={12}
					padding={12}
				>
					<Avatar src={guildIcon} name={guildName} size={50} marginRight={20} />
					<Pane display="flex" alignItems="center" justifyContent="center">
						<Heading is="h2" size={800} marginBottom={6} marginRight={12}>
							{guildName}
						</Heading>
						<Pane paddingX={6}>
							<Badge
								color="purple"
								textTransform="none"
								fontSize="0.9em"
								padding={5}
								height="auto"
								width="auto"
							>
								{channelName}
							</Badge>
						</Pane>
					</Pane>
				</Pane>
				<Pane display="flex" justifyContent="center" padding={12}>
					<Avatar
						src={usherAvatar}
						name={usherName}
						size={50}
						marginRight={20}
					/>
					<Text is="h2" size={600} color="blue500">
						{usherName}
					</Text>
					<Text>will show you to your seat</Text>
				</Pane>
				<Pane background="tint2" padding={16} marginY={12} width="100%">
					<Pane marginBottom={16} display="flex" flexDirection="column">
						<Text marginBottom={6} size={400}>
							To accept:
						</Text>
						<StatusIndicator color="success" marginBottom={4}>
							Verify your Discord account
						</StatusIndicator>
						<StatusIndicator color="success">
							Accept the Discord invite
						</StatusIndicator>
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
