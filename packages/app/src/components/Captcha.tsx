import React, { useCallback, useState } from "react";
import { Heading, Pane, Spinner, Text, toaster } from "evergreen-ui";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { css } from "@linaria/core";

import { hcaptchaSiteKey } from "@/env-config";
import * as mediaQueries from "@/utils/media-queries";

const sitekey = hcaptchaSiteKey as string;

export type Props = {
	onSuccess: (token: string) => Promise<boolean>;
};

const CaptchaContainer: React.FC<Props> = ({ onSuccess }) => {
	const [isLoading, setLoading] = useState(true);

	const submit = useCallback(
		async (token: string) => {
			setLoading(true);
			onSuccess(token).finally(() => {
				setLoading(false);
			});
		},
		[onSuccess]
	);

	const onError = useCallback(() => {
		toaster.danger(
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
			className={css`
				${mediaQueries.isLarge} {
					padding: 10px;
				}
			`}
		>
			<Heading is="h1" size={800} marginBottom={12}>
				You&apos;re not a bot are you?
			</Heading>
			<Text size={500}>Please verify your anti-bot-ness below</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<Pane>
					<HCaptcha
						sitekey={sitekey}
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

export default CaptchaContainer;
