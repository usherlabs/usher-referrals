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
import PropTypes from "prop-types";

const EmailConnectScreen = ({ connect }) => {
	const [isLoading, setLoading] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [value, setValue] = useState("");
	const connectHandler = useCallback(() => {
		if (/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/.test(value)) {
			setLoading(true);
			setDisabled(true);
			connect(value)
				.then(() => {
					toaster.notify(
						"An email with a Magic Link has been sent to you. Click the link in the email to Sign In."
					);
					setTimeout(() => {
						setDisabled(false);
					}, 10000);
				})
				.finally(() => setLoading(false));
		} else {
			toaster.warning("Input must be a valid email.");
		}
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
			<Pane background="tint2" padding={16} margin={12}>
				<Pane display="flex" alignItems="center" border>
					<TextInput
						name="email"
						placeholder="youremail@example.com"
						disabled={isDisabled || isLoading}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyPress={(e) => {
							if (e.which === 13) {
								connectHandler(e);
							}
						}}
						height={48}
						borderTopRightRadius={0}
						borderBottomRightRadius={0}
						borderWidth={0}
						minWidth={250}
					/>
					<Button
						onClick={connectHandler}
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

EmailConnectScreen.propTypes = {
	connect: PropTypes.func.isRequired
};

export default EmailConnectScreen;
