import axios from "axios";
import axiosRetry from "axios-retry";
import { discord as discordEnv } from "@/server/env-config";

const request = axios.create({
	baseURL: `https://discord.com/api/v9`,
	headers: {
		Authorization: `Bot ${discordEnv.botToken}`
	}
});

axiosRetry(request, { retries: 3 });

export default request;
