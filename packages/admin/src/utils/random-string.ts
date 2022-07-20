export const randomString = (
	length: number,
	chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
	let result = "";
	for (let i = length; i > 0; i -= 1) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
};
