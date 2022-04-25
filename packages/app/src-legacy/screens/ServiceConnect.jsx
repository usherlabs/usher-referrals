import React, { useState } from "react";
import { Pane, Heading, Text, Button, majorScale } from "evergreen-ui";
import PropTypes from "prop-types";
import Image from "next/image";

import DiscordWhiteIcon from "@/assets/icon/discord-white-icon.svg";

const ServiceConnectScreen = ({ connect }) => {
	const [isLoading, setLoading] = useState(false);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				Next steps...
			</Heading>
			<Text size={500}>Connect your Discord account.</Text>
			<Pane background="tint2" padding={16} margin={12}>
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
				>
					<strong>Connect Discord</strong>
				</Button>
			</Pane>
		</Pane>
	);
};

ServiceConnectScreen.propTypes = {
	connect: PropTypes.func.isRequired
};

export default ServiceConnectScreen;
