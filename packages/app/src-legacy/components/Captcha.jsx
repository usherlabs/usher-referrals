import React, { useState, useCallback } from "react";
import { Pane, Heading, Text, Spinner, toaster } from "evergreen-ui";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PropTypes from "prop-types";

// import PropTypes from "prop-types";
import { hcaptchaSiteKey } from "@/env-config";

const CaptchaContainer = ({ onSuccess }) => {
	const [isLoading, setLoading] = useState(true);

	const submit = useCallback(async (token) => {
		setLoading(true);
		onSuccess(token).finally(() => {
			setLoading(false);
		});
	}, []);

	const onError = useCallback(() => {
		toaster.error(
			"That looks like something a Bot would do. Please try again."
		);
	}, []);

	const onLoad = useCallback(() => {
		setLoading(false);
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			flex={1}
			alignItems="center"
			justifyContent="center"
			padding={32}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				You&apos;re not a bot are you?
			</Heading>
			<Text size={500}>Please verify your anti-bot-ness below</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<Pane>
					<HCaptcha
						sitekey={hcaptchaSiteKey}
						onVerify={submit}
						onError={onError}
						onLoad={onLoad}
					/>
				</Pane>
				{isLoading && (
					<Pane
						padding={12}
						display="flex"
						alignItems="center"
						width="100%"
						justifyContent="center"
					>
						<Spinner size={30} />
					</Pane>
				)}
			</Pane>
		</Pane>
	);
};

CaptchaContainer.propTypes = {
	onSuccess: PropTypes.func.isRequired
};

export default CaptchaContainer;