import React, { useCallback } from "react";

import { submitCaptcha } from "@/actions/user";
import { useUser } from "@/hooks/";
import delay from "@/utils/delay";
import Captcha from "@/components/Captcha";

const CaptchaScreen = () => {
	const {
		user,
		actions: { setUser }
	} = useUser();

	const onSuccess = useCallback(
		async (token: string) => {
			const isSuccess = await submitCaptcha(token);
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
