import ky from "ky";

// const formatQs = (o: Record<string, string>) => {
// 	const searchParams = new URLSearchParams(o);
// 	return searchParams.toString();
// };

export const request = ky.create({
	prefixUrl: "/api"
});

export const captcha = () => ({
	post: (token: string, id?: string[]): Promise<{ success: boolean }> =>
		request
			.post("captcha", {
				json: {
					token,
					id
				}
			})
			.json(),
	get: (id: string): Promise<{ success: boolean }> =>
		request.get(`captcha?id=${id}`).json()
});

export const bot = () => ({
	post: (requestId: string): Promise<{ success: boolean }> =>
		request
			.post("bot", {
				json: {
					requestId
				}
			})
			.json()
});
