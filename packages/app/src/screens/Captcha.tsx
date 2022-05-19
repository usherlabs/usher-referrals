import React, { useCallback } from "react";

import * as api from "@/api";
import { useUser } from "@/hooks/";
import delay from "@/utils/delay";
import Captcha from "@/components/Captcha";

const CaptchaScreen = () => {
	const {
		user,
		actions: { setCaptcha }
	} = useUser();

	const onSuccess = useCallback(
		async (token: string) => {
			const { success: isSuccess } = await api.captcha().post(token, user.id);
			if (isSuccess) {
				await delay(1000);
				setCaptcha(true);
				return true;
			}
			return false;
		},
		[user]
	);

	return <Captcha onSuccess={onSuccess} />;
};

export default CaptchaScreen;
