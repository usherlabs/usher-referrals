import React, { useCallback } from "react";

import * as api from "@/api";
import { useUser } from "@/hooks/";
import delay from "@/utils/delay";
import Captcha from "@/components/Captcha";

const CaptchaScreen = () => {
	const {
		user,
		actions: { setUser } // Replace this with setCaptcha?
	} = useUser();

	const onSuccess = useCallback(
		async (token: string) => {
			const { success: isSuccess } = await api.captcha().post(token, user.id);
			if (isSuccess && user !== null) {
				const checkedUser = {
					...user,
					verifications: { ...(user?.verifications || {}), captcha: true }
				};
				await delay(1000);
				setUser(checkedUser);
				return true;
			}
			return false;
		},
		[user]
	);

	return user !== null ? <Captcha onSuccess={onSuccess} /> : null;
};

export default CaptchaScreen;
