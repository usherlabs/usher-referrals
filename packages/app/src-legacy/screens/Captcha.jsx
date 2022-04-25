import React, { useCallback } from "react";
import set from "lodash/set";

// import PropTypes from "prop-types";
import { submitCaptcha } from "@/actions/user";
import { useUser } from "@/hooks/";
import delay from "@/utils/delay";
import Captcha from "@/components/Captcha";

const CaptchaScreen = () => {
	const [user, , { setUser }] = useUser();

	const onSuccess = useCallback(
		async (token) => {
			const isSuccess = await submitCaptcha(token);
			if (isSuccess) {
				const checkedUser = { ...user };
				set(checkedUser, "verifications.captcha", true);
				await delay(1000);
				setUser(checkedUser);
			}
		},
		[user]
	);

	return <Captcha onSuccess={onSuccess} />;
};

export default CaptchaScreen;
