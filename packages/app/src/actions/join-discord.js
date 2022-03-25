import getAuthReqeust from "@/utils/request";

const joinDiscordGuild = async () => {
	const request = await getAuthReqeust();
	const response = await request.post("/discord").then(({ data }) => data);

	return response;
};

export default joinDiscordGuild;
