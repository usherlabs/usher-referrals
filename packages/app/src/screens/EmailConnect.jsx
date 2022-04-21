import React, { useState, useCallback } from "react";
import {
	Pane,
	Heading,
	Text,
	TextInput,
	Button,
	Spinner,
	ArrowRightIcon,
	toaster
} from "evergreen-ui";
// import PropTypes from "prop-types";

import { useUser } from "@/hooks/";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";

const EmailConnectScreen = () => {
	const [, isLoading, { signIn }] = useUser();
	const [isDisabled, setDisabled] = useState(false);
	const [value, setValue] = useState("");

	const connect = useCallback(async () => {
		if (!/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/.test(value)) {
			toaster.warning("Input must be a valid email.");
			return;
		}
		setDisabled(true);
		// Connect with Email
		const { error } = await signIn({
			email: value
		});
		setTimeout(() => {
			setDisabled(false);
		}, 5000);
		if (error) {
			if (error.status === 429) {
				toaster.notify(
					"An email with a Magic Link has already been sent to you!",
					{ id: "magic-link-sent", duration: 10 }
				);
				return;
			}
			handleException(error);
			alerts.error();
			return;
		}
		toaster.success(
			"An email with a Magic Link has been sent to you. Click the link in the email to Sign In.",
			{ duration: 10 }
		);
	}, [value]);

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
				🔒&nbsp;&nbsp;Sign In
			</Heading>
			<Text size={500}>Connect with your Email.</Text>
			<Pane background="tint2" padding={16} margin={12} borderRadius={8}>
				<Pane display="flex" alignItems="center" border>
					<TextInput
						name="email"
						placeholder="youremail@example.com"
						disabled={isDisabled || isLoading}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyPress={(e) => {
							if (e.which === 13) {
								connect(e);
							}
						}}
						height={48}
						borderTopRightRadius={0}
						borderBottomRightRadius={0}
						borderWidth={0}
						minWidth={250}
					/>
					<Button
						onClick={connect}
						height={48}
						appearance="primary"
						disabled={isDisabled || isLoading || value.length === 0}
						borderTopLeftRadius={0}
						borderBottomLeftRadius={0}
						width={50}
						padding={0}
						display="flex"
						alignItems="center"
					>
						{isLoading ? <Spinner size={30} /> : <ArrowRightIcon />}
					</Button>
				</Pane>
			</Pane>
		</Pane>
	);
};

EmailConnectScreen.propTypes = {};

export default EmailConnectScreen;
