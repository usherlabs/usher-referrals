import React from "react";
import { Pane, useTheme, Label, Text, Strong } from "evergreen-ui";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";

/**
 * Progess Bar
 *
 * @param   {Number}  value  value between 1 and 100
 */
const Progress = ({
	value,
	height,
	label,
	showPercentage,
	message,
	step,
	totalSteps
}) => {
	const { colors } = useTheme();

	const barProps = {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		borderRadius: 100
	};

	let v = value;
	if (v > 100) {
		v = 100;
	} else if (v < 0) {
		v = 0;
	}

	return (
		<Pane>
			{label && (
				<Pane marginBottom={8}>
					<Label>{label}</Label>
				</Pane>
			)}
			<Pane
				position="relative"
				width="100%"
				height={height}
				borderRadius={100}
				overflow="hidden"
				marginBottom={6}
			>
				<Pane background={colors.gray400} {...barProps} />
				<Pane
					background={colors.blue500}
					{...barProps}
					width={`${v}%`}
					zIndex={5}
				/>
			</Pane>
			{!isEmpty(message) && (
				<Pane display="flex" alignItems="center" justifyContent="flex-end">
					<Text size={300}>{message}</Text>
				</Pane>
			)}
			{step > 0 && (
				<Pane display="flex" alignItems="center" justifyContent="flex-end">
					<Text size={300}>
						<Strong>
							Step {step}
							{totalSteps > 0 ? ` of ${totalSteps}` : ""}
						</Strong>
					</Text>
				</Pane>
			)}
			{showPercentage && (
				<Pane display="flex" alignItems="center" justifyContent="flex-end">
					<Text size={300}>{v}%</Text>
				</Pane>
			)}
		</Pane>
	);
};

Progress.propTypes = {
	label: PropTypes.string,
	value: PropTypes.number,
	height: PropTypes.number,
	showPercentage: PropTypes.bool,
	step: PropTypes.number,
	totalSteps: PropTypes.number,
	message: PropTypes.string
};

Progress.defaultProps = {
	label: "",
	value: 0,
	height: 5,
	showPercentage: false,
	step: 0,
	totalSteps: 0,
	message: ""
};

export default Progress;
