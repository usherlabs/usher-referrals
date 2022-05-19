import React, { useState, useCallback } from "react";
import {
	Pane,
	TextInput,
	Button,
	Spinner,
	ArrowRightIcon,
	toaster
} from "evergreen-ui";
// import PropTypes from "prop-types";

import isEmail from "@/utils/is-email";

export type Props = {
	onSubmit: (value: string) => Promise<void>;
	disabled?: boolean;
	loading?: boolean;
};

const EmailSubmit: React.FC<Props> = ({
	onSubmit,
	disabled: disabledProp,
	loading
}) => {
	const [disabledState, setDisabled] = useState(false);
	const [value, setValue] = useState("");
	const disabled = disabledProp || disabledState;

	const submit = useCallback(async () => {
		if (isEmail(value)) {
			toaster.warning("Input must be a valid email.");
			return;
		}
		setDisabled(true);
		await onSubmit(value);
		setDisabled(false);
	}, [value]);

	return (
		<Pane display="flex" alignItems="center" border>
			<TextInput
				name="email"
				placeholder="youremail@example.com"
				disabled={disabled}
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setValue(e.target.value);
				}}
				onKeyPress={(e: React.KeyboardEvent) => {
					if (e.key.toLowerCase() === "enter") {
						submit();
					}
				}}
				height={48}
				borderTopRightRadius={0}
				borderBottomRightRadius={0}
				borderWidth={0}
				minWidth={250}
			/>
			<Button
				onClick={submit}
				height={48}
				appearance="primary"
				disabled={disabled || loading || value.length === 0}
				borderTopLeftRadius={0}
				borderBottomLeftRadius={0}
				width={50}
				padding={0}
				display="flex"
				alignItems="center"
			>
				{loading ? <Spinner size={30} /> : <ArrowRightIcon />}
			</Button>
		</Pane>
	);
};

EmailSubmit.defaultProps = {
	onSubmit: () => Promise.resolve(),
	disabled: false,
	loading: false
};

export default EmailSubmit;
