import axios from "axios";
import axiosRetry from "axios-retry";

const request = axios.create({
	baseURL: `https://discord.com/api/v9`
});

axiosRetry(request, { retries: 3 });

export default request;
