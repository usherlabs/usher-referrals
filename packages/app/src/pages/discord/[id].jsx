import { useCallback, useState, useEffect } from "react";
import { Pane } from "evergreen-ui";
import { useRouter } from "next/router";
import isEmpty from "lodash/isEmpty";

import useUser from "@/providers/User";
import { supabase } from "@/utils/supabase-client";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import Preloader from "@/components/Preloader";
import getAuthReqeust, { getRequest } from "@/utils/request";
import DicordInviteScreen from "@/components/DicordInviteScreen";

const request = getRequest();
const signIn = () =>
	supabase.auth.signIn(
		{
			provider: "discord"
		},
		{
			scopes: "identify"
		}
	);

const DiscordInvite = () => {
	const [isPreloading, setPreloading] = useState(true);
	const [usher, setUsher] = useState({});
	const [user, isUserLoading] = useUser();
	const router = useRouter();

	const { id: usherId } = router.query;

	const connectService = useCallback(async () => {
		// Connect to Discord
		const { error } = await signIn();
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	useEffect(() => {
		(async () => {
			// Check if Invitee is already authenticated
			if (!isEmpty(user) && !isUserLoading) {
				// If so, request an invite link and redirect
				const authReq = await getAuthReqeust();
				const resp = authReq
					.get(`/discord?id=${usherId}`)
					.then(({ data }) => data);
				const code = resp.data?.code;
				if (code) {
					// Use replace to mitigate users spam visiting the invite link
					window.location.replace(`https://discord.gg/${code}`);
				}
			}
		})();
		if (!isUserLoading) {
			setPreloading(false);
		}
	}, [user, isUserLoading]);

	useEffect(() => {
		(async () => {
			// Execute request to fetch Usher details for the given id
			const response = await request
				.get(`/usher?id=${usherId}`)
				.then(({ data }) => data);
			const { data } = response;
			setUsher(data);
			setPreloading(false);
		})();
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			padding={16}
			maxWidth={1280}
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{isUserLoading || (isPreloading && <Preloader />)}
			{isEmpty(user) && !isUserLoading && (
				<DicordInviteScreen
					connect={connectService}
					usherUsername={usher.profile.name}
					usherAvatar={usher.profile.avatar_url}
					guildName={usher.guild.name}
					guildIcon={usher.guild.icon_url}
					channelName={usher.channel.name}
				/>
			)}
		</Pane>
	);
};

export default DiscordInvite;
