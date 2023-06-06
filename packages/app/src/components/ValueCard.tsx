/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import { Pane, Text } from "evergreen-ui";

import InputField, { Props as InputFieldProps } from "@/components/InputField";

type Props = InputFieldProps & {
	value?: string | number | React.ReactNode;
	ticker?: string;
	scrollable?: boolean;
};

const ValueCard: React.FC<Props> = ({
	value,
	ticker,
	scrollable,
	...props
}) => {
	return (
		<InputField iconSize={18} background="tint2" {...props}>
			<Pane
				width="100%"
				display="flex"
				flexDirection="row"
				height={42}
				alignItems="center"
				paddingX={8}
				{...(scrollable
					? {
							overflowX: "auto"
					  }
					: {})}
			>
				<Text display="block" flex={1} paddingX={6} size={500}>
					{value}
				</Text>
				<Text display="block" paddingX={6} size={500} fontWeight={700}>
					{ticker}
				</Text>
			</Pane>
		</InputField>
	);
};

ValueCard.defaultProps = {
	value: "",
	ticker: ""
};

export default ValueCard;
