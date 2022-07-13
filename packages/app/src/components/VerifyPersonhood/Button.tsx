import React from "react";
import {
	Button,
	Strong,
	majorScale,
	useTheme,
	ButtonProps
} from "evergreen-ui";
import { UilDna } from "@iconscout/react-unicons";
import { css } from "@linaria/core";

type Props = ButtonProps;

const VerifyPersonhoodButton: React.FC<Props> = ({ ...props }) => {
	const { colors } = useTheme();

	return (
		<Button
			height={majorScale(5)}
			iconBefore={<UilDna color={colors.gray800} />}
			className={css`
				svg {
					width: 25px;
					height: 25px;
				}
			`}
			{...props}
		>
			<Strong>Verify your personhood</Strong>
		</Button>
	);
};

export default VerifyPersonhoodButton;
