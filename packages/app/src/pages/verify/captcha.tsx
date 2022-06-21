import { useCallback } from "react";
import { useRouter } from "next/router";

import { useUser } from "@/hooks";
import DashboardContainer from "@/containers/Dashboard";
import Captcha from "@/components/Captcha";
import delay from "@/utils/delay";
import * as api from "@/api";
import Authenticate from "@/modules/auth";

const Screen = () => {
	const router = useRouter();
	const {
		user: { wallets },
		actions: { setCaptcha }
	} = useUser();

	const onSuccess = useCallback(
		async (token: string) => {
			const authInstance = Authenticate.getInstance();
			const authToken = await authInstance.getAuthToken();
			const { success: isSuccess } = await api.captcha(authToken).post(token);
			if (isSuccess) {
				await delay(1000);
				setCaptcha(true);

				const urlParams = new URLSearchParams(window.location.search);
				const redir = decodeURIComponent(urlParams.get("redir") || "");
				if (redir) {
					router.push(redir);
				} else {
					router.push("/");
				}

				return true;
			}
			return false;
		},
		[wallets]
	);

	return <Captcha onSuccess={onSuccess} />;
};

const VerifyCaptcha = () => {
	return (
		<DashboardContainer>
			<Screen />
		</DashboardContainer>
	);
};

export default VerifyCaptcha;
