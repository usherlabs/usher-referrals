/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import PropTypes from "prop-types";
import { Text, Pane } from "evergreen-ui";

import InputField from "@/components/InputField";

const ValueCard = ({ value, ticker, ...props }) => {
	return (
		<InputField
			id="affiliate-link"
			label="Affiliate Link"
			iconSize={18}
			background="tint2"
			{...props}
		>
			<Pane
				width="100%"
				display="flex"
				flexDirection="row"
				height={42}
				alignItems="center"
				paddingX={8}
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

ValueCard.propTypes = {
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	ticker: PropTypes.string
};

ValueCard.defaultProps = {
	value: "",
	ticker: ""
};

export default ValueCard;
