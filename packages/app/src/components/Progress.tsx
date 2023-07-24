import React from "react";
import { Label, Pane, Strong, Text } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = {
	label: string;
	value: number;
	height?: number;
	showPercentage?: boolean;
	step?: number;
	totalSteps?: number;
	message?: string;
};

/**
 * Progess Bar
 *
 * @param   {Number}  value  value between 1 and 100
 */
const Progress: React.FC<Props> = ({
	value,
	height,
	label,
	showPercentage,
	message,
	step = 0,
	totalSteps = 0
}) => {
	const { colors } = useCustomTheme();

	const barProps = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		borderRadius: 100
	};

	let v = value * 100;
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
				<Pane background={colors.gray400} position="absolute" {...barProps} />
				<Pane
					background={colors.blue500}
					position="absolute"
					{...barProps}
					width={`${parseFloat(v.toFixed(2))}%`}
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
					<Text size={300}>{parseFloat(v.toFixed(2))}%</Text>
				</Pane>
			)}
		</Pane>
	);
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
