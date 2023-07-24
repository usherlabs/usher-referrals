import React from "react";
import { Button, ButtonProps, majorScale, Strong } from "evergreen-ui";
import { UilDna } from "@iconscout/react-unicons";
import { css } from "@linaria/core";
import { useCustomTheme } from "@/brand/themes/theme";

type Props = ButtonProps;

const VerifyPersonhoodButton: React.FC<Props> = ({ ...props }) => {
	const { colors } = useCustomTheme();

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
