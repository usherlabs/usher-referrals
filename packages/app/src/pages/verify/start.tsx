import { useCallback } from "react";
import { useRouter } from "next/router";
import { Pane } from "evergreen-ui";

import { useUser } from "@/hooks";
import DashboardContainer from "@/containers/Dashboard";
import delay from "@/utils/delay";
import * as api from "@/api";
import Authenticate from "@/modules/auth";

const Screen = () => {
	const router = useRouter();
	const {
		actions: { setPersonhood }
	} = useUser();

	const onSuccess = useCallback(async () => {
		const authInstance = Authenticate.getInstance();
		const authToken = await authInstance.getAuthToken();
		const { success: isSuccess } = await api.personhood(authToken).post();
		if (isSuccess) {
			await delay(1000);
			setPersonhood(true);

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
	}, []);

	return (
		<Pane>
			<Pane>Hello world</Pane>
		</Pane>
	);
};

const VerifyStart = () => {
	return (
		<DashboardContainer>
			<Screen />
		</DashboardContainer>
	);
};

export default VerifyStart;
