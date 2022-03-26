import React from "react";
import PropTypes from "prop-types";
import { Pane, Strong, Paragraph } from "evergreen-ui";

import ErrorText from "./ErrorText";

const InputField = ({
	id,
	label,
	description,
	Description,
	placeholder,
	error,
	children,
	isRequired,
	labelSize,
	labelProps,
	descriptionProps,
	errorProps,
	inputContainerProps,
	iconRight: IconRight,
	iconLeft: IconLeft,
	iconSize,
	iconPad,
	...props
}) => {
	const inputPropsSetup = {
		spellCheck: false,
		required: isRequired,
		id,
		background: "inherit"
	};
	if (error) {
		inputPropsSetup.isInvalid = true;
	}
	return (
		<Pane width="100%" {...props}>
			<Pane width="100%">
				<Pane
					is="label"
					display="block"
					htmlFor={id}
					marginBottom={6}
					{...labelProps}
				>
					{isRequired && (
						<Paragraph
							fontWeight={900}
							opacity="0.5"
							textTransform="uppercase"
							fontSize={10}
							letterSpacing={1}
						>
							Required
						</Paragraph>
					)}
					<Strong size={labelSize}>{label}</Strong>
				</Pane>
				{description && (
					<Paragraph marginBottom={12} width="100%" {...descriptionProps}>
						{description}
					</Paragraph>
				)}
				{Description && (
					<Pane marginBottom={12} width="100%" {...descriptionProps}>
						<Description />
					</Pane>
				)}
			</Pane>
			<Pane
				display="flex"
				width="100%"
				flexDirection="row"
				alignItems="center"
				background="#fff"
				border
				borderRadius={8}
				overflow="hidden"
				padding={2}
				{...inputContainerProps}
			>
				{IconLeft && (
					<Pane padding={iconPad} display="flex" alignItems="center">
						<IconLeft size={iconSize} />
					</Pane>
				)}
				<Pane flex={1} width="100%">
					{React.Children.map(children, (child) =>
						React.cloneElement(child, { ...inputPropsSetup })
					)}
				</Pane>
				{IconRight && (
					<Pane padding={iconPad} display="flex" alignItems="center">
						<IconRight size={iconSize} />
					</Pane>
				)}
			</Pane>
			{!!error && <ErrorText {...errorProps} text={error} />}
		</Pane>
	);
};

InputField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	description: PropTypes.string,
	Description: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.node,
		PropTypes.func
	]),
	placeholder: PropTypes.string,
	error: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	isRequired: PropTypes.bool,
	iconLeft: PropTypes.element,
	iconRight: PropTypes.element,
	iconSize: PropTypes.number,
	iconPad: PropTypes.number,
	labelSize: PropTypes.number,
	labelProps: PropTypes.object,
	descriptionProps: PropTypes.object,
	errorProps: PropTypes.object,
	inputContainerProps: PropTypes.object
};

InputField.defaultProps = {
	label: "",
	description: "",
	Description: undefined,
	placeholder: "",
	error: "",
	children: undefined,
	isRequired: false,
	iconLeft: null,
	iconRight: null,
	iconSize: 16,
	iconPad: 12,
	labelSize: 400,
	labelProps: {},
	descriptionProps: {},
	errorProps: {},
	inputContainerProps: {}
};

export default InputField;
