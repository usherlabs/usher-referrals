import got from "got";
import FormData from "form-data";

import { hcaptchaSecretKey } from "@/server/env-config";

const captcha = async (token: string) => {
	const formData = new FormData();
	formData.append("secret", hcaptchaSecretKey);
	formData.append("response", token);
	const response: { success: boolean } = await got
		.post("https://hcaptcha.com/siteverify", {
			body: formData
		})
		.json();

	return response;
};

export default captcha;
